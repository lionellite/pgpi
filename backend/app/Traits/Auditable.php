<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Http\Request;

trait Auditable
{
    /**
     * Log an action
     */
    protected function logAction(
        string $action,
        string $modelType,
        int $modelId,
        Request $request,
        ?string $justification = null,
        ?array $oldData = null,
        ?array $newData = null
    ): void {
        AuditLog::create([
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'user_id' => $request->user()->id,
            'justification' => $justification,
            'old_values' => $oldData,
            'new_values' => $newData,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
