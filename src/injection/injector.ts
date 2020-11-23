import 'reflect-metadata';

export type Type<T> = { new(...constructorArgs: any[]): T };

export interface Provider {
    provide: Type<any>;
    useClass: Type<any>;
}

export class Injector {

    private injectables: Map<Type<any>, Object> = new Map();
    private providers: Provider[];

    public resolve<T>(type: Type<T>): T {
        const result = this.getInjectable(type);
        if (result) {
            return <T>result;
        } else {
            return this.create(type);
        }
    }

    public setProviders(providers?: Provider[]) {
        if (providers) {
            this.providers = providers;
        }
    }

    private create<T>(type: Type<T>): T {
        
        const dfs = (dep: Type<any>) => {
            if (this.hasInjectable(dep)) {
                return;
            }
            
            const depDeps = this.getDependencies(dep);

            if (depDeps) {
                depDeps.forEach(dfs);

                if (depDeps.length === 0) {
                    this.setInjectable(dep, new dep());
                } else if (depDeps.length === 1) {
                    this.setInjectable(dep, new dep(this.getInjectable(depDeps[0])));
                } else {
                    this.setInjectable(dep, new dep(...depDeps.map(d => this.getInjectable(d))));
                }

                
            } else {
                throw new Error(`No se puede resulver el tipo '${dep}'`);
            }
    
        };
    
        dfs(this.translateType(type));

        const result = this.getInjectable(type);
        if (result) {
            return <T>result;
        } else {
            throw new Error(`No se puede resulver el tipo '${type}'`);
        } 
    }

    private translateType<T>(type: Type<T>): Type<T> {
        if (!this.providers) {
            return type;
        }

        const replacement = this.providers.find(p => p.provide === type);
        if (replacement) {
            return <Type<T>>replacement.useClass;
        } else {
            return type;
        }
    }

    private hasInjectable<T>(type: Type<T>): boolean {
        return this.injectables.has(this.translateType(type));
    }

    private setInjectable<T>(type: Type<T>, injectable: T): void {
        this.injectables.set(this.translateType(type), injectable);
    }

    private getInjectable<T>(type: Type<T>): T {
        return <T>this.injectables.get(this.translateType(type));
    }

    private getDependencies(type: Type<any>): Type<any>[] {
        const declaredDependencies: Type<any>[] = Reflect.getOwnMetadata('design:paramtypes', type) || [];
        if (this.providers) {
            return declaredDependencies.map(declared => this.translateType(declared));
        } else {
            return declaredDependencies;
        }
    }

}