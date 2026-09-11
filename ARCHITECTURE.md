# Architecture

The public site owns discovery, domain search, package selection, quote calculation,
and order intake. Domain and quote logic is behind server routes and provider
interfaces. Registrar management, renewals, DNS, email provisioning, and service
operations belong in PShareHub. The current routes run sandbox behavior until external
credentials and persistence are configured.
