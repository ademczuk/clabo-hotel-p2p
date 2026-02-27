/**
 * P2PCommunicationManager
 *
 * Replaces NitroCommunicationManager for P2P mode.
 * Instead of creating a SocketConnection, it creates a P2PLoopbackConnection
 * that routes messages locally through P2PRoomState.
 *
 * The NitroCommunicationDemo still handles the handshake flow — it sends
 * SSOTicketMessageComposer which P2PRoomState intercepts and responds to
 * with AUTHENTICATED, triggering the normal authentication chain.
 */
import {
  ICommunicationManager,
  IConnection,
  IConnectionStateListener,
  IMessageConfiguration,
  IMessageEvent,
  INitroCommunicationDemo,
  INitroCommunicationManager,
  INitroEvent,
  NitroConfiguration,
  NitroLogger,
} from "../../../api";
import { NitroManager } from "../../../core";
import { NitroCommunicationDemoEvent, SocketConnectionEvent } from "../../../events";
import { Nitro } from "../../Nitro";
import { NitroCommunicationDemo } from "../NitroCommunicationDemo";
import { NitroMessages } from "../NitroMessages";
import { P2PLoopbackConnection } from "./P2PLoopbackConnection";

export class P2PCommunicationManager extends NitroManager implements INitroCommunicationManager, IConnectionStateListener {
  private _communication: ICommunicationManager;
  private _connection: IConnection;
  private _messages: IMessageConfiguration;
  private _demo: INitroCommunicationDemo;

  constructor(communication: ICommunicationManager) {
    super();

    this._communication = communication;
    this._connection = null;
    this._messages = new NitroMessages();
    this._demo = new NitroCommunicationDemo(this);

    this.onConnectionOpenedEvent = this.onConnectionOpenedEvent.bind(this);
    this.onConnectionClosedEvent = this.onConnectionClosedEvent.bind(this);
    this.onConnectionErrorEvent = this.onConnectionErrorEvent.bind(this);
    this.onConnectionAuthenticatedEvent = this.onConnectionAuthenticatedEvent.bind(this);
  }

  protected override onInit(): void {
    if (this._connection) return;

    Nitro.instance.events.addEventListener(
      NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED,
      this.onConnectionAuthenticatedEvent
    );

    // Create P2PLoopbackConnection instead of SocketConnection
    this._connection = new P2PLoopbackConnection(this._communication, this);
    this._connection.registerMessages(this._messages);

    this._connection.addEventListener(SocketConnectionEvent.CONNECTION_OPENED, this.onConnectionOpenedEvent);
    this._connection.addEventListener(SocketConnectionEvent.CONNECTION_CLOSED, this.onConnectionClosedEvent);
    this._connection.addEventListener(SocketConnectionEvent.CONNECTION_ERROR, this.onConnectionErrorEvent);

    if (this._demo) this._demo.init();

    // Pass the socket URL — P2PLoopbackConnection ignores it but uses it to trigger init
    this._connection.init(NitroConfiguration.getValue<string>("socket.url", "p2p://local"));
  }

  protected override onDispose(): void {
    if (this._demo) this._demo.dispose();

    if (this._connection) {
      this._connection.removeEventListener(SocketConnectionEvent.CONNECTION_OPENED, this.onConnectionOpenedEvent);
      this._connection.removeEventListener(SocketConnectionEvent.CONNECTION_CLOSED, this.onConnectionClosedEvent);
      this._connection.removeEventListener(SocketConnectionEvent.CONNECTION_ERROR, this.onConnectionErrorEvent);
    }

    Nitro.instance.events.removeEventListener(
      NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED,
      this.onConnectionAuthenticatedEvent
    );

    super.onDispose();
  }

  private onConnectionOpenedEvent(event: Event): void {
    NitroLogger.log("[P2P] Loopback connection opened");
  }

  private onConnectionClosedEvent(event: CloseEvent): void {
    NitroLogger.log("[P2P] Loopback connection closed");
  }

  private onConnectionErrorEvent(event: Event): void {
    NitroLogger.log("[P2P] Loopback connection error");
  }

  private onConnectionAuthenticatedEvent(event: INitroEvent): void {
    NitroLogger.log("[P2P] Connection authenticated");
    if (this._connection) this._connection.authenticated();
  }

  public connectionInit(socketUrl: string): void {
    NitroLogger.log("[P2P] Initializing P2P connection (ignoring socket URL:", socketUrl, ")");
  }

  public registerMessageEvent(event: IMessageEvent): IMessageEvent {
    if (this._connection) this._connection.addMessageEvent(event);
    return event;
  }

  public removeMessageEvent(event: IMessageEvent): void {
    if (!this._connection) return;
    this._connection.removeMessageEvent(event);
  }

  public get demo(): INitroCommunicationDemo {
    return this._demo;
  }

  public get connection(): IConnection {
    return this._connection;
  }
}
