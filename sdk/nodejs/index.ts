// *** WARNING: this file was generated by pulumi-language-nodejs. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

// Export members:
export { NodeJsLambdaArgs } from "./nodeJsLambda";
export type NodeJsLambda = import("./nodeJsLambda").NodeJsLambda;
export const NodeJsLambda: typeof import("./nodeJsLambda").NodeJsLambda = null as any;
utilities.lazyLoad(exports, ["NodeJsLambda"], () => require("./nodeJsLambda"));

export { ProviderArgs } from "./provider";
export type Provider = import("./provider").Provider;
export const Provider: typeof import("./provider").Provider = null as any;
utilities.lazyLoad(exports, ["Provider"], () => require("./provider"));


const _module = {
    version: utilities.getVersion(),
    construct: (name: string, type: string, urn: string): pulumi.Resource => {
        switch (type) {
            case "nodelambda:index:NodeJsLambda":
                return new NodeJsLambda(name, <any>undefined, { urn })
            default:
                throw new Error(`unknown resource type ${type}`);
        }
    },
};
pulumi.runtime.registerResourceModule("nodelambda", "index", _module)
pulumi.runtime.registerResourcePackage("nodelambda", {
    version: utilities.getVersion(),
    constructProvider: (name: string, type: string, urn: string): pulumi.ProviderResource => {
        if (type !== "pulumi:providers:nodelambda") {
            throw new Error(`unknown provider type ${type}`);
        }
        return new Provider(name, <any>undefined, { urn });
    },
});
