import { onPatch, destroy, types, onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree';

const model = types
    .model('exampleModel', {
        _enabled: false,
        _count: 0
    })
    .views(self => {
        return {
            get enabled() {
                return self._enabled;
            },
            get count() {
                return self._count;
            }
        }
    })
    .actions(self => {
        return {
            inc() {
                if (!self._enabled) {
                    throw new Error('not enabled');
                }
                self._count++;
            },
            enable(state: boolean) {
                self._enabled = state;
            }
        };
    });


describe('model', () => {

    let instance = model.create();

    beforeEach(() => {

        if (instance != null) {
            destroy(instance);
        }

        instance = model.create();
    });

    it('supports basic interaction', () => {

        expect(instance.enabled).toBeFalsy();
        expect(instance.count).toBe(0);

        instance.enable(true);
        expect(instance.enabled).toBeTruthy();

        instance.inc();
        expect(instance.count).toBe(1);

        instance.enable(false);
        expect(instance.enabled).toBeFalsy();

        expect(instance.inc).toThrow();
    });

    it('can be snapshotted', () => {

        instance.enable(true);
        instance.inc();
        instance.inc();

        const snapshot = getSnapshot(instance);

        expect(snapshot).toEqual({
            _enabled: true,
            _count: 2
        });
    });

    it('can be imported from snapshot', () => {

        const snapshot = {
            _enabled: true,
            _count: 15
        };

        applySnapshot(instance, snapshot);

        expect(instance.count).toBe(15);
    });

    it('fires on each state change', () => {

        let invocationCount = 0;

        onSnapshot(instance, () => {
            invocationCount++;
        });

        expect(invocationCount).toBe(0);

        instance.enable(true);

        expect(invocationCount).toBe(1);

        instance.inc();

        expect(invocationCount).toBe(2);

        instance.enable(false);
        expect(instance.inc).toThrow();

        expect(invocationCount).toBe(3);
    });

    it('notifies about granular patches', () => {

        const patches: any[] = [];

        onPatch(instance, (patch) => {
            patches.push(patch);
            // console.log(patch.op + ' ' + patch.path + ' ' + patch.value);
        });

        instance.enable(true);
        instance.inc();
        instance.inc();

        expect(patches.length).toBe(3);
        expect(patches[0].op).toBe('replace');
        expect(patches[0].path).toBe('/_enabled');
        expect(patches[1].op).toBe('replace');
        expect(patches[1].path).toBe('/_count');
        expect(patches[2].op).toBe('replace');
        expect(patches[2].path).toBe('/_count');

    })
});