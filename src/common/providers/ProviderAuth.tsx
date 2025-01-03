import * as React from 'react';
import dynamic from 'next/dynamic';
import { 
  OrganizationSwitcher, 
  RedirectToSignIn, 
  SignedIn, 
  SignedOut, 
  UserButton, 
  useClerk 
} from '@clerk/nextjs';
import { useRouter } from 'next/router';

const enableClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Dynamically import ClerkProvider only if ENABLE_CLERK is true
const ClerkProviderDynamic = !enableClerk ? null : dynamic(() =>
  import('@clerk/nextjs')
    .then(({ ClerkProvider }) => ClerkProvider)
    .catch(err => {
      console.error('Failed to load ClerkProvider:', err);
      const AuthLoadIssue = () => <>Issue Loading Auth</>;
      AuthLoadIssue.displayName = 'AuthLoadIssue';
      return AuthLoadIssue;
    }),
);

export const ProviderAuth = (props: { children: React.ReactNode }) => (enableClerk && ClerkProviderDynamic)
  ? (
    <ClerkProviderDynamic>
      <SignedIn>
        <CheckOrganizationRedirect />
        {props.children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProviderDynamic>
  ) : props.children;

export const authUserButton = (enableClerk && ClerkProviderDynamic)
  ? <>
    <UserButton />
  </>
  : null;

export const authOrganizationSwitcher = (enableClerk && ClerkProviderDynamic)
  ? <>
    <OrganizationSwitcher 
      afterCreateOrganizationUrl={'/'}
    />
  </>
  : null;

const CheckOrganizationRedirect = () => {
  const { loaded, user } = useClerk();
  const router = useRouter();

  React.useEffect(() => {
    if (loaded && user) {
      const hasOrganization = user?.organizationMemberships?.length > 0;
      
      if (!hasOrganization) {
        router.push('https://rare-mosquito-63.accounts.dev/create-organization');  
      }
    }
  }, [loaded, user, router]);

  return null;
};
