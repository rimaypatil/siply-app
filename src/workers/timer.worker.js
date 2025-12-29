/* eslint-disable no-restricted-globals */
// A robust worker to keep the timer running off the main thread

// self.onmessage = (e) => {
//     const { action, interval } = e.data;
// }

let timerId = null;

function tick() {
    self.postMessage('tick');
    // Re-schedule
    // in background tabs, even workers can be throttled, but this is better than main thread
    timerId = setTimeout(tick, 10000); // Check every 10 seconds
}

self.onmessage = (e) => {
    if (e.data === 'start') {
        if (!timerId) {
            tick();
        }
    } else if (e.data === 'stop') {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    }
};
