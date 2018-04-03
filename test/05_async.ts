import { flow, isRoot, getRoot, destroy, types, onSnapshot, getSnapshot, applySnapshot, onPatch, addMiddleware } from 'mobx-state-tree';

const wait = (ms: number) => {

    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const model = types.model('model', {
    count: 0,
    busy: false
}).actions((self) => {
    
    const delayedUpdate = flow(function* () {

        self.busy = true;
        yield wait(5000);

        self.busy = false;
        self.count += 1;
    });

    return {
        delayedUpdate
    }
});


describe('model', () => {

    let instance = model.create();

    beforeEach(() => {

        if (instance != null) {
            destroy(instance);
        }

        instance = model.create();
    });

    it('supports async flow', async () => {

        jest.useFakeTimers();

        expect(instance.busy).toBeFalsy();
        expect(instance.count).toBe(0);

        const promise = instance.delayedUpdate();

        expect(instance.busy).toBeTruthy();
        expect(instance.count).toBe(0);

        jest.runAllTimers();

        await promise;

        expect(instance.busy).toBeFalsy();
        expect(instance.count).toBe(1);      

    });
});