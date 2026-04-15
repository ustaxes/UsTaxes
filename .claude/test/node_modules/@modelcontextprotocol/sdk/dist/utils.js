/**
 * Returns an AbortSignal that will enter aborted state after `timeoutMs` milliseconds.
 */
export function abortAfterTimeout(timeoutMs) {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, timeoutMs);
    return controller.signal;
}
//# sourceMappingURL=utils.js.map