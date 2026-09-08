{{/*
The CNPG Cluster's name, defined ONCE.

Everything that references the cluster — Database, ScheduledBackup, Pooler —
must name it exactly as the Cluster is created. They did not: the Cluster was
"<chart>-cnpg-cluster" while the three consumers said "<chart>-cnpg", a name
that has never existed. Nothing rejects a reference to a missing cluster, so
this failed silently for months: no base backup ever completed (WAL archiving
was on, but WALs without a base backup cannot be restored), the Database CR
never reconciled, and the Pooler never came up.

Referencing this helper instead of retyping the suffix is what stops that
happening again.
*/}}
{{- define "app.cnpgClusterName" -}}
{{ .Chart.Name }}-cnpg-cluster
{{- end }}
