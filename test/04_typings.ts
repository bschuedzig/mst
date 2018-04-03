import { isRoot, getRoot, destroy, types, onSnapshot, getSnapshot, applySnapshot, onPatch, addMiddleware } from 'mobx-state-tree';

const model = types.model('model', {
    id: 0,
    name: types.maybe(types.string)
}).actions((self) => {
    return {
        add(x: number) {
            self.id += x;
        },
        setName(name: string) {
            self.name = name;
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

    it('supports typings', () => {

        type modelType = typeof model.Type;

        const upcast = instance as any;
        
        const downcast = upcast as modelType;

        expect(downcast.id).toBe(0);
    });
});