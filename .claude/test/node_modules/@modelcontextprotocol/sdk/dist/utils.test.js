import { abortAfterTimeout } from "./utils.js";
describe("abortAfterTimeout", () => {
    it("should abort after timeout", () => {
        const signal = abortAfterTimeout(0);
        expect(signal.aborted).toBe(false);
        return new Promise((resolve) => {
            setTimeout(() => {
                expect(signal.aborted).toBe(true);
                resolve(true);
            }, 0);
        });
    });
});
//# sourceMappingURL=utils.test.js.map