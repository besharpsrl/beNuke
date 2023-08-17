import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Project, Source, BuildSpec, LinuxArmBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { awsNukeVersion, buttonEnabled, codebuildRoleName, configBucketName, configFileName, functionName, targetRoleName } from '../parameters'
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda'

export class BeNukeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'beNuke-Bucket', {
      bucketName: configBucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const projectRole = new Role(this, 'beNuke-CodeBuildProjectRole', {
      roleName: codebuildRoleName,
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
    })

    const project = new Project(this, 'beNuke-CodeBuildProject', {
      role: projectRole,
      source: Source.s3({
        bucket: bucket,
        path: ''
      }),
      environment: {
        buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              `wget https://github.com/rebuy-de/aws-nuke/releases/download/${awsNukeVersion}/aws-nuke-${awsNukeVersion}-linux-arm64.tar.gz`,
              `tar -xf aws-nuke-${awsNukeVersion}-linux-arm64.tar.gz`,
              'wget https://github.com/mikefarah/yq/releases/download/v4.34.1/yq_linux_arm64 && mv yq_linux_arm64 /usr/bin/yq && chmod +x /usr/bin/yq'
            ],
          },
          build: {
            commands: [
              `yq ".accounts | keys | .[]" ${configFileName} -r`,
              `for account_id in $(yq ".accounts | keys | .[]" ${configFileName} -r); do ./aws-nuke-${awsNukeVersion}-linux-arm64 -c ${configFileName} --force --assume-role-arn "arn:aws:iam::\${account_id}:role/${targetRoleName}"; done`
            ],
          },
        },
      }),
    });
    bucket.grantRead(project)

    if (buttonEnabled) {
      const lambdaRole = new Role(this, 'LambdaRole', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });

      new Function(this, 'beNukeTriggerLambda', {
        functionName: functionName,
        runtime: Runtime.PYTHON_3_10,
        handler: 'iot-lambda.lambda_handler',
        code: Code.fromAsset('resources/'),
        environment: {
          CODEBUILD: project.projectName
        },
        role: lambdaRole
      });

      lambdaRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['codebuild:StartBuild'],
          resources: [project.projectArn],
        })
      );
    }
  }
}
