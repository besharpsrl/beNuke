#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { accountId, region } from '../parameters';
import { BeNukeStack } from '../lib/beNuke-stack';

const app = new cdk.App();
new BeNukeStack(app, 'BeNukeStack', {
  env: { account: accountId, region: region },
});
