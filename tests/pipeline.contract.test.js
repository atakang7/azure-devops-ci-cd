import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../azure-pipelines.yml', import.meta.url), 'utf8');
const stage = name => source.match(new RegExp('(?:^|\\n)- stage: ' + name + '(?=\\n|$)'))?.index ?? -1;

describe('Azure pipeline contract', () => {
  it('promotes strictly through verification and approval stages', () => {
    const names = ['CI', 'Staging', 'Smoke', 'TesterReview', 'ApproveProduction', 'Production'];
    const indices = names.map(stage);
    expect(indices.every(index => index >= 0)).toBe(true);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
    for (const dependency of ['dependsOn: CI', 'dependsOn: Staging',
      'dependsOn: Smoke', 'dependsOn: TesterReview', 'dependsOn: ApproveProduction']) {
      expect(source).toContain(dependency);
    }
  });

  it('requires readiness, bounded Jira review and human production approval', () => {
    expect(source).toContain('/readyz');
    expect(source).toContain('curl --fail');
    expect(source).not.toContain('continueOnError: true');
    expect(source).toContain('ManualValidation@0');
    expect(source).toContain('Wait for tester approval');
    expect(source).toContain('Jira review timed out');
    expect(source).toContain('Jira review rejected');
  });

  it('never stores inline Jira credentials in the canonical pipeline', () => {
    expect(source).toContain('JIRA_AUTH: $(jiraBasicAuth)');
    expect(source).toContain('deployment-settings');
    expect(source).not.toMatch(/encodedCreds\s*=|jiraCreds\s*:\s*['"][A-Za-z0-9+/=]{20,}/i);
  });
});
