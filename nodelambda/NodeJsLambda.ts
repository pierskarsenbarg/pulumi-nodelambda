import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as esbuild from "esbuild";
import * as schema from "./schema-types";

export class NodeJsLambda extends schema.NodeJsLambda {
    constructor(name: string, args: schema.NodeJsLambdaArgs, opts?: pulumi.ComponentResourceOptions) {
        super(name, args, opts);

        let esbuildNodeVersion: string = getEsbuildNodeVersion(args.runtime);

        const esbuildConfiguration: esbuild.BuildOptions = {
            platform: "node",
            target: esbuildNodeVersion,
            outdir: "dist",
            bundle: true,
            minify: true,
            sourcemap: false
        };

        const esBuildOutput = pulumi.all([args.path]).apply(([path]) => {
            return esbuild.buildSync({
                ...esbuildConfiguration,
                entryPoints: [path]
            })
        });

        const fn = esBuildOutput.apply(x => new aws.lambda.Function(name, {
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive("./dist")
            }),
            runtime: args.runtime,
            handler: args.handler,
            role: args.role
        }, {parent: this}));

        this.functionName = fn.name;
        this.registerOutputs({
            "functionName": this.functionName
        })
    }
}

const getEsbuildNodeVersion = (runtime: pulumi.Input<string>) : string => {
    switch(runtime) {
        case aws.lambda.Runtime.NodeJS12dX:
            return "node12";
        case aws.lambda.Runtime.NodeJS14dX:
            return "node14";
        case aws.lambda.Runtime.NodeJS16dX:
            return "node16";
        case aws.lambda.Runtime.NodeJS18dX:
            return "node18";
        default: 
            return "node18";
    }
}