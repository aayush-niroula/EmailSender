<?php

namespace Database\Seeders;

use App\Models\Recipient;
use App\Models\RecipientGroup;
use Illuminate\Database\Seeder;

class RecipientSeeder extends Seeder
{
    public function run(): void
    {
        $customers = RecipientGroup::create([
            'name' => 'Customers',
            'slug' => 'customers',
        ]);

        $employees = RecipientGroup::create([
            'name' => 'Employees',
            'slug' => 'employees',
        ]);

        $branchManagers = RecipientGroup::create([
            'name' => 'Branch Managers',
            'slug' => 'branch-managers',
        ]);

        Recipient::create([
            'recipient_group_id' => $customers->id,
            'name' => 'Ram Sharma',
            'email' => 'ram@gmail.com',
        ]);

        Recipient::create([
            'recipient_group_id' => $customers->id,
            'name' => 'Sita Thapa',
            'email' => 'sita@gmail.com',
        ]);

        Recipient::create([
            'recipient_group_id' => $employees->id,
            'name' => 'Hari KC',
            'email' => 'hari@gmail.com',
        ]);

        Recipient::create([
            'recipient_group_id' => $branchManagers->id,
            'name' => 'John Doe',
            'email' => 'john@gmail.com',
        ]);
    }
}