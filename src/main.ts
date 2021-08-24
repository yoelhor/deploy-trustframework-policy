const core = require('@actions/core');
const fs = require('fs');
(global as any).fetch = require('node-fetch'); // Polyfill for graph client
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientCredentialsAuthProvider } from './auth';

async function main() {
  try {
    const file = core.getInput('file');
    const policy = core.getInput('policy');
    const tenant = core.getInput('tenant');
    const clientId = core.getInput('clientId');
    const clientSecret = core.getInput('clientSecret');

    core.info('Uploading policy file ' + file);

    let client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        tenant,
        clientId,
        clientSecret
      ),
      defaultVersion: 'beta'
    });

    if (fs.existsSync(file)) {
      let fileStream = fs.createReadStream(file);
      let response = await client
        .api(`trustFramework/policies/${policy}/$value`)
        .putStream(fileStream);

      core.notice('Policy file ' + file + ' has been uploaded successfully.');
    }
    else
    {
      core.error('Policy file ' + file + ' not found.')
      core.setFailed();
    }

  } catch (error) {
    let errorText = error.message ?? error;
    core.error('Action failed: ' + errorText);
    core.setFailed();
  }
}

main();
