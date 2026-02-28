/**
 * P2PLoopbackConnection
 *
 * Replaces the SocketConnection for P2P mode.
 * Instead of connecting to a WebSocket server, this connection:
 *  1. Intercepts outgoing messages and routes them to P2PRoomState
 *  2. Accepts injected incoming messages (binary packets) and processes them
 *     through the standard Nitro message pipeline
 *
 * It implements the full IConnection interface so it can be used as a drop-in
 * replacement for SocketConnection in NitroCommunicationManager.
 */
import {
  ICodec,
  ICommunicationManager,
  IConnection,
  IConnectionStateListener,
  IMessageComposer,
  IMessageConfiguration,
  IMessageDataWrapper,
  IMessageEvent,
  NitroLogger,
} from "../../../api";
import { EventDispatcher, EvaWireFormat, MessageClassManager } from "../../../core";
import { SocketConnectionEvent } from "../../../events";
import { BinaryWriter } from "../../../api";
import { P2PRoomState } from "./P2PRoomState";

export class P2PLoopbackConnection extends EventDispatcher implements IConnection {
  private _communicationManager: ICommunicationManager;
  private _stateListener: IConnectionStateListener;
  private _messages: MessageClassManager;
  private _codec: ICodec;
  private _dataBuffer: ArrayBuffer;
  private _isReady: boolean;
  private _isAuthenticated: boolean;
  private _pendingClientMessages: IMessageComposer<unknown[]>[];
  private _pendingServerMessages: IMessageDataWrapper[];
  private _roomState: P2PRoomState;

  constructor(communicationManager: ICommunicationManager, stateListener: IConnectionStateListener) {
    super();

    this._communicationManager = communicationManager;
    this._stateListener = stateListener;
    this._messages = new MessageClassManager();
    this._codec = new EvaWireFormat();
    this._dataBuffer = new ArrayBuffer(0);
    this._isReady = false;
    this._isAuthenticated = false;
    this._pendingClientMessages = [];
    this._pendingServerMessages = [];
    this._roomState = null;
  }

  /**
   * Instead of connecting to a WebSocket, we immediately fire CONNECTION_OPENED
   * which triggers the NitroCommunicationDemo handshake flow.
   */
  public init(socketUrl: string): void {
    if (this._stateListener) {
      this._stateListener.connectionInit(socketUrl);
    }

    NitroLogger.log("[P2P] Loopback connection initialized (no WebSocket)");

    // Create the P2P room state manager
    this._roomState = new P2PRoomState(this);

    // Simulate the WebSocket "open" event after a short delay
    // to allow the NitroCommunicationDemo to register its event listeners
    setTimeout(() => {
      this.dispatchEvent(new SocketConnectionEvent(
        SocketConnectionEvent.CONNECTION_OPENED, this, new Event("open")
      ));
    }, 500);
  }

  protected override onDispose(): void {
    super.onDispose();

    if (this._roomState) {
      this._roomState.destroy();
      this._roomState = null;
    }

    this._communicationManager = null;
    this._stateListener = null;
    this._messages = null;
    this._codec = null;
    this._dataBuffer = null;
  }

  public onReady(): void {
    if (this._isReady) return;

    this._isReady = true;

    if (this._pendingServerMessages && this._pendingServerMessages.length) {
      this.processWrappers(...this._pendingServerMessages);
    }

    if (this._pendingClientMessages && this._pendingClientMessages.length) {
      this.send(...this._pendingClientMessages);
    }

    this._pendingServerMessages = [];
    this._pendingClientMessages = [];
  }

  public authenticated(): void {
    this._isAuthenticated = true;
  }

  /**
   * Intercept outgoing messages and route them to P2PRoomState
   * instead of sending them over a WebSocket.
   */
  public send(...composers: IMessageComposer<unknown[]>[]): boolean {
    if (this.disposed || !composers) return false;

    composers = [...composers];

    if (this._isAuthenticated && !this._isReady) {
      if (!this._pendingClientMessages) this._pendingClientMessages = [];
      this._pendingClientMessages.push(...composers);
      return false;
    }

    for (const composer of composers) {
      if (!composer) continue;

      const header = this._messages.getComposerId(composer);

      if (header === -1) {
        NitroLogger.packets("Unknown Composer", composer.constructor.name);
        continue;
      }

      NitroLogger.packets("OutgoingComposer", header, composer.constructor.name, composer.getMessageArray());

      // Route to P2PRoomState instead of WebSocket
      if (this._roomState) {
        this._roomState.handleOutgoingMessage(header, composer.constructor.name, composer);
      }
    }

    return true;
  }

  /**
   * Inject an incoming message by constructing a binary packet from arguments.
   * This is the simple form that uses the EvaWire codec format.
   *
   * @param header - The incoming message header ID
   * @param args - The message arguments (will be encoded as EvaWire)
   */
  public injectIncomingMessage(header: number, ...args: any[]): void {
    const w = new BinaryWriter();
    w.writeShort(header);

    for (const arg of args) {
      if (typeof arg === "number") {
        w.writeInt(arg);
      } else if (typeof arg === "string") {
        w.writeString(arg, true);
      } else if (typeof arg === "boolean") {
        w.writeByte(arg ? 1 : 0);
      }
    }

    const innerBuffer = w.getBuffer();
    const outerWriter = new BinaryWriter();
    outerWriter.writeInt(innerBuffer.byteLength);
    outerWriter.writeBytes(innerBuffer);

    const packet = outerWriter.getBuffer();
    this._dataBuffer = this.concatArrayBuffers(this._dataBuffer, packet);
    this.processReceivedData();
  }

  public processReceivedData(): void {
    try {
      this.processData();
    } catch (err) {
      NitroLogger.error("[P2P] Error processing received data:", err);
    }
  }

  private processData(): void {
    const wrappers = this.splitReceivedMessages();

    if (!wrappers || !wrappers.length) return;

    if (this._isAuthenticated && !this._isReady) {
      if (!this._pendingServerMessages) this._pendingServerMessages = [];
      this._pendingServerMessages.push(...wrappers);
      return;
    }

    this.processWrappers(...wrappers);
  }

  private processWrappers(...wrappers: IMessageDataWrapper[]): void {
    if (!wrappers || !wrappers.length) return;

    for (const wrapper of wrappers) {
      if (!wrapper) continue;

      const messages = this.getMessagesForWrapper(wrapper);

      if (!messages || !messages.length) continue;

      NitroLogger.packets("IncomingMessage", wrapper.header, messages[0].constructor.name, messages[0].parser);

      this.handleMessages(...messages);
    }
  }

  private splitReceivedMessages(): IMessageDataWrapper[] {
    if (!this._dataBuffer || !this._dataBuffer.byteLength) return null;
    return this._codec.decode(this);
  }

  private concatArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const array = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    array.set(new Uint8Array(buffer1), 0);
    array.set(new Uint8Array(buffer2), buffer1.byteLength);
    return array.buffer;
  }

  private getMessagesForWrapper(wrapper: IMessageDataWrapper): IMessageEvent[] {
    if (!wrapper) return null;

    const events = this._messages.getEvents(wrapper.header);

    if (!events || !events.length) {
      NitroLogger.packets("IncomingMessage", wrapper.header, "UNREGISTERED", wrapper);
      return null;
    }

    try {
      //@ts-ignore
      const parser = new events[0].parserClass();

      if (!parser || !parser.flush() || !parser.parse(wrapper)) return null;

      for (const event of events) event.parser = parser;
    } catch (e) {
      NitroLogger.error("[P2P] Error parsing message", e, events[0].constructor.name);
      return null;
    }

    return events;
  }

  private handleMessages(...messages: IMessageEvent[]): void {
    messages = [...messages];

    for (const message of messages) {
      if (!message) continue;

      message.connection = this;

      if (message.callBack) message.callBack(message);
    }
  }

  public registerMessages(configuration: IMessageConfiguration): void {
    if (!configuration) return;
    this._messages.registerMessages(configuration);
  }

  public addMessageEvent(event: IMessageEvent): void {
    if (!event || !this._messages) return;
    this._messages.registerMessageEvent(event);
  }

  public removeMessageEvent(event: IMessageEvent): void {
    if (!event || !this._messages) return;
    this._messages.removeMessageEvent(event);
  }

  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  public get dataBuffer(): ArrayBuffer {
    return this._dataBuffer;
  }

  public set dataBuffer(buffer: ArrayBuffer) {
    this._dataBuffer = buffer;
  }

  public get roomState(): P2PRoomState {
    return this._roomState;
  }
}
