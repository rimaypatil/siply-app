/* eslint-disable no-restricted-globals */
// A simple worker to keep the timer running off the main thread
// self.onmessage = (e) => {
//     const { action, interval } = e.data;
// }

// We'll just run a simple interval that ticks every 10 seconds
// and lets the main thread decide if it's time to notify.
// This prevents the main thread from throttling the timer loop excessively.

let timerId = null;

self.onmessage = (e) => {
    if (e.data === 'start') {
        if (!timerId) {
            timerId = setInterval(() => {
                self.postMessage('tick');
            }, 10000); // Tick every 10 seconds
        }
    } else if (e.data === 'stop') {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }
};
