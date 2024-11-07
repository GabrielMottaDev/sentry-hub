import React, { ReactNode } from 'react';

// Define the types for each provider entry
type ProviderEntry =
  | React.ComponentType<any> // Component alone
  | [React.ComponentType<any>, Record<string, any>?]; // Component with optional props

interface ProvidersProps {
  providers: ProviderEntry[];
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ providers, children }) => {
  return providers.reduceRight((acc, provider) => {
    // Check if provider is an array (i.e., a tuple with props)
    if (Array.isArray(provider)) {
      const [Provider, props] = provider;
      return <Provider {...(props || {})}>{acc}</Provider>;
    }
    // If it's just a component, render it without props
    const Provider = provider;
    return <Provider>{acc}</Provider>;
  }, children);
};

export default Providers;
