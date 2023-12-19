import * as nodelamda from "@pierskarsenbarg/nodelambda";

const roleArn = "arn:aws:iam::052848974346:role/node-lambda-role-809411e"

const lambda = new nodelamda.NodeJsLambda("fn", {
    role: roleArn,
    path: "./app",
    handler: "app.index",
    runtime: "nodejs18.x"
})