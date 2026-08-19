import assert from 'node:assert/strict';
import test from 'node:test';
import * as adminAccess from './admin-access.ts';

test('the environment whitelist bootstraps a super admin when no database role exists', () => {
  assert.equal(
    adminAccess.resolveAdminRole({ databaseRole: null, environmentWhitelisted: true }),
    'super_admin'
  );
});

test('a stored role is preserved and only a super admin may manage administrators', () => {
  assert.equal(
    adminAccess.resolveAdminRole({ databaseRole: 'editor', environmentWhitelisted: true }),
    'editor'
  );
  assert.equal(adminAccess.canManageAdminUsers('super_admin'), true);
  assert.equal(adminAccess.canManageAdminUsers('admin'), false);
  assert.equal(adminAccess.canManageAdminUsers('editor'), false);
  assert.equal(adminAccess.canManageAdminUsers('moderator'), false);
});

test('an unlisted account without a stored role receives no admin access', () => {
  assert.equal(
    adminAccess.resolveAdminRole({ databaseRole: null, environmentWhitelisted: false }),
    null
  );
});

test('the admin portal fails closed when neither Google nor a local admin session is authorized', () => {
  const canAccessAdminPortal = (
    adminAccess as typeof adminAccess & {
      canAccessAdminPortal?: (role: 'super_admin' | null, hasLocalSession: boolean) => boolean;
    }
  ).canAccessAdminPortal;

  assert.equal(typeof canAccessAdminPortal, 'function', 'canAccessAdminPortal is not implemented');
  assert.equal(canAccessAdminPortal?.(null, false), false);
  assert.equal(canAccessAdminPortal?.('super_admin', false), true);
  assert.equal(canAccessAdminPortal?.(null, true), true);
});
