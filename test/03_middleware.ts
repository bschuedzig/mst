import { isRoot, getRoot, destroy, types, onSnapshot, getSnapshot, applySnapshot, onPatch, addMiddleware } from 'mobx-state-tree';

const model = types.model('model', {
    id: 0
}).actions((self) => {
    return {
        add(x: number) {
            self.id += x;
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

    it('can have middlewares applied', () => {

        const calls: any[] = [];

        addMiddleware(instance, (call, next) => {

            calls.push(call);
            return next(call);
        });

        instance.add(5);

        expect(calls.length).toBe(1);
        expect(calls[0].type).toBe('action');
        expect(calls[0].name).toBe('add');
        expect(calls[0].args.length).toBe(1);
        expect(calls[0].args[0]).toBe(5);

    });

    it('can have middlewares change the arguments', () => {

        const calls: any[] = [];

        addMiddleware(instance, (call, next) => {

            call.args[0] = call.args[0] * 2;
            return next(call);
        });

        instance.add(5);

        expect(instance.id).toBe(10);
    });

});