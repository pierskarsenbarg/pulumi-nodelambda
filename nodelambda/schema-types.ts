/* tslint:disable */
/**
 * This file was automatically generated by pulumi-provider-scripts.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source Pulumi Schema file,
 * and run "pulumi-provider-scripts gen-provider-types" to regenerate this file. */
import * as pulumi from "@pulumi/pulumi";
export type ConstructComponent<T extends pulumi.ComponentResource = pulumi.ComponentResource> = (name: string, inputs: any, options: pulumi.ComponentResourceOptions) => T;
export type ResourceConstructor = {
    readonly "nodelambda:index:NodeJsLambda": ConstructComponent<NodeJsLambda>;
};
export type Functions = {};
export abstract class NodeJsLambda<TData = any> extends (pulumi.ComponentResource)<TData> {
    public functionName?: string | pulumi.Output<string>;
    constructor(name: string, args: pulumi.Inputs, opts: pulumi.ComponentResourceOptions = {}) {
        super("nodelambda:index:NodeJsLambda", name, opts.urn ? { functionName: undefined } : { name, args, opts }, opts);
    }
}
export interface NodeJsLambdaArgs {
    readonly runtime: pulumi.Input<string>;
    readonly role: pulumi.Input<string>;
    readonly handler?: pulumi.Input<string>;
    readonly memorySize?: pulumi.Input<number>;
    readonly path: pulumi.Input<string>;
}
