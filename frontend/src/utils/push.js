import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Ask permission, subscribe via the service worker's PushManager, register the
 * subscription with the backend, and send a confirmation notification.
 */
export async function enablePush() {
    if (!pushSupported()) throw new Error('unsupported');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('denied');

    const reg = await navigator.serviceWorker.ready;
    const { data } = await axios.get(`${API_BASE_URL}/api/push/public-key`);
    if (!data.publicKey) throw new Error('push-not-configured'); // VAPID keys not set on the server

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
        sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });
    }

    const json = sub.toJSON();
    // The backend sends a confirmation ping right after a new subscription is saved.
    await axios.post(`${API_BASE_URL}/api/push/subscribe`, {
        endpoint: sub.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
    });
    return true;
}
