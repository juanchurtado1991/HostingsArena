// Re-export from modularized composition directory
// NOTE: Consumers should import directly from './composition/HostingComposition'
// to avoid macOS case-insensitive path conflicts.
export { HostingComposition, type CompositionProps } from './composition/HostingComposition';
