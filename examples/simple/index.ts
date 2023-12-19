import * as nodelamda from "@pierskarsenbarg/nodelambda";
import * as aws from "@pulumi/aws";

const role = new aws.iam.Role("node-lambda-role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal)
})

const lambda = new nodelamda.NodeJsLambda("fn", {
    role: role.arn,
    path: "./app",
    handler: "app.index",
    runtime: aws.lambda.Runtime.NodeJS18dX
})