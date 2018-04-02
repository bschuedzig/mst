import { onPatch, isRoot, getRoot, destroy, types, onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree';

const model = types.model('model', {
    id: 0,
    child: types.maybe(types.late(() => hierarchy1))
});

const hierarchy1 = types.model('hierarchy1', {
    id: 1,
    child: types.maybe(types.late(() => hierarchy2))
});

const hierarchy2 = types.model('hierarchy2', {
    id: 2,
    child: types.maybe(types.late(() => hierarchy3))
});

const hierarchy3 = types.model('hierarchy3', {
    id: 3
}).actions((self) => {
    return {
        inc() {
            self.id++;
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

    it('knows that it is root node', () => {

        expect(isRoot(instance)).toBeTruthy();     

    });

    it('can be dehydrated from snapshot', () => {

        const snapshot = {
            id: 1,
            child: {
                id: 2,
                child: {
                    id: 3
                }
            }
        };

        applySnapshot(instance, snapshot);
        expect(instance.child!.child!.id).toBe(3);
    });

    it('will ignore erroneous snapshot data', () => {

        const snapshot = {
            id: 11,
            child: {
                id1: 22,
                child1: {
                    id2: 33
                }
            }
        };

        applySnapshot(instance, snapshot);

        expect(instance.id).toBe(11);
        expect(instance.child).not.toBeNull();
        expect(instance.child!.id).toBe(1);
        expect(instance.child!.child).toBeNull();
    });


    it('can infer root node from child node', () => {

        const snapshot = {
            id: 1,
            child: {
                id: 2,
                child: {
                    id: 3,
                    child: {
                        id: 4
                    }
                }
            }
        };

        applySnapshot(instance, snapshot);

        const lastChild = instance.child!.child!.child!;
        expect(lastChild.id).toBe(4);

        const root = getRoot(lastChild);

        expect(root).toBe(instance);
        expect(getSnapshot(root)).toEqual(snapshot);
    });

    it('received patches on a child in the root node', () => {

        const snapshot = {
            id: 1,
            child: {
                id: 2,
                child: {
                    id: 3,
                    child: {
                        id: 4
                    }
                }
            }
        };

        applySnapshot(instance, snapshot);

        let patches: any[] = [];

        onPatch(instance, (patch) => {
            patches.push(patch);
        });

        instance.child!.child!.child!.inc();

        expect(patches.length).toBe(1);
        expect(patches[0].op).toBe('replace');
        expect(patches[0].path).toBe('/child/child/child/id');
    })

});