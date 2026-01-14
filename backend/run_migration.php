<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illine\Contracts\Console\Kernel::class);

// Run the migration
try {
    // Check if the column already exists
    $connection = DB::connection();
    $schema = $connection->getSchemaBuilder();

    if (!$schema->hasColumn('users', 'last_login_at')) {
        $schema->table('users', function (Blueprint $table) {
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });
        echo "Successfully added last_login_at column to users table.\n";
    } else {
        echo "The last_login_at column already exists in the users table.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
