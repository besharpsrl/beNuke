// Main deployment variables
export const accountId = '00000000000' // account ID of the account where this will be deployed
export const region = 'eu-west-1'

// Resource names
export const configBucketName = 'benuke-bucket-changeme' // !!! CHANGEME !!!
export const codebuildRoleName = 'beNuke-CodeBuildProjectRole' // remember to match it with the one in the CF parameters
export const targetRoleName = 'beNuke-assumed-role' // remember to match it with the one in the CF parameters

// Other variables
export const awsNukeVersion = 'v2.23.0'
export const configFileName = 'beNuke-config.yaml'

// Nuke Button
export const buttonEnabled = true // set to true to enable IoT Button trigger support
export const functionName = 'iotNukeTrigger'
