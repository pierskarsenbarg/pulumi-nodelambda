import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as esbuild from "esbuild";

interface NodeLambdaArgs {
    runtime: aws.lambda.Runtime;
    path: string;
    role: pulumi.Input<string>
    handler: string;
    layers?: pulumi.Input<string[]> | undefined;
    memorySize?: number | 128;
}

export class NodeLambda extends pulumi.ComponentResource {
    public readonly functionName : pulumi.Output<string>;
    constructor(name: string, args: NodeLambdaArgs, opts?: pulumi.ComponentResourceOptions) {
        super("x:index:NodeLambda", name, args, opts);

        let esbuildNodeVersion: string = getEsbuildNodeVersion(args.runtime);
        const esbuildConfiguration: esbuild.BuildOptions = {
            platform: "node",
            target: esbuildNodeVersion,
            outdir: "dist",
            bundle: true,
            minify: true,
            sourcemap: false,
            entryPoints: [args.path]
        };

        const esBuildOutput = pulumi.output(esbuild.buildSync({
            ...esbuildConfiguration
        }));

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

const getEsbuildNodeVersion = (runtime: aws.lambda.Runtime) : string => {
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