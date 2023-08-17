import boto3
import os

def lambda_handler(event, context):
    codebuild_project_name = os.environ['CODEBUILD']

    codebuild_client = boto3.client('codebuild')

    try:
        response = codebuild_client.start_build(
            projectName=codebuild_project_name,
        )

        build_id = response['build']['id']
        build_status = response['build']['buildStatus']
        return f"CodeBuild project {codebuild_project_name} triggered. Build ID: {build_id}, Status: {build_status}"
    except Exception as e:
        return f"Error triggering CodeBuild project {codebuild_project_name}: {str(e)}"
