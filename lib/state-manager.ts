import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// A singleton structure for managing our synchronized Y.Doc
class StateManager {
    private static instance: StateManager
    public doc: Y.Doc
    public provider: WebsocketProvider | null = null
    public rois: Y.Map<any>
    public routes: Y.Map<any>

    private constructor() {
        this.doc = new Y.Doc()
        // We map ROIs using Y.Map to get CRDT collaborative syncing
        this.rois = this.doc.getMap('rois')
        this.routes = this.doc.getMap('routes')
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager()
        }
        return StateManager.instance
    }

    public connect(token: string) {
        if (this.provider) return

        // In a prod env, determine the correct WSS URL based on next config / domain
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${protocol}//${window.location.host}/api/ws/yjs?token=${token}`

        // Start a Websocket Provider to sync our Yjs Doc with the Server and Peers
        this.provider = new WebsocketProvider(
            wsUrl,
            'sentinel-collab-room',
            this.doc,
            {
                connect: true,
                maxBackoffTime: 5000,
                disableBc: false // Cross-tab offline sync fallback
            }
        )

        this.provider.on('status', (event: any) => {
            console.log(`[YJS Collaborative Sync] System Status: ${event.status}`) // connected or disconnected
            // Trigger auto-reconnect if dropped unexpectedly
            if (event.status === 'disconnected' && this.provider?.shouldConnect) {
                console.warn("[YJS] Disconnected: Queuing for reconnect...")
            }
        })
    }

    public disconnect() {
        if (this.provider) {
            this.provider.disconnect()
            this.provider = null
        }
    }
}

export const stateManager = StateManager.getInstance()
