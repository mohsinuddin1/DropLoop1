// Quick Supabase Diagnostic Script
// Paste this in your browser console to check what's wrong

console.log('🔍 SUPABASE DIAGNOSTIC CHECK');
console.log('═'.repeat(50));

// Check 1: Environment Variables
console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES:');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is missing!');
    console.log('👉 Fix: Add VITE_SUPABASE_URL to your .env file');
} else {
    console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is missing!');
    console.log('👉 Fix: Add VITE_SUPABASE_ANON_KEY to your .env file');
} else {
    console.log('✅ VITE_SUPABASE_ANON_KEY exists (length:', supabaseKey.length, ')');
}

// Check 2: Supabase Client
console.log('\n2️⃣ CHECKING SUPABASE CLIENT:');
try {
    const { supabase } = await import('./src/supabase/client.js');
    if (supabase) {
        console.log('✅ Supabase client loaded successfully');

        // Check 3: Test Bucket Access
        console.log('\n3️⃣ TESTING BUCKET ACCESS:');
        try {
            const { data, error } = await supabase.storage
                .from('id-verifications')
                .list();

            if (error) {
                console.error('❌ Bucket access error:', error);
                if (error.message.includes('not found')) {
                    console.log('👉 Fix: Create "id-verifications" bucket in Supabase');
                } else if (error.message.includes('policy')) {
                    console.log('👉 Fix: Create SELECT policy for id-verifications bucket');
                }
            } else {
                console.log('✅ Bucket "id-verifications" is accessible!');
                console.log('📁 Current files:', data.length);
            }
        } catch (bucketErr) {
            console.error('❌ Bucket test failed:', bucketErr);
        }
    } else {
        console.error('❌ Supabase client is undefined');
    }
} catch (importErr) {
    console.error('❌ Failed to import Supabase client:', importErr);
}

console.log('\n' + '═'.repeat(50));
console.log('🎯 DIAGNOSIS COMPLETE\n');
console.log('Common fixes:');
console.log('1. Add .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
console.log('2. Restart dev server: npm run dev');
console.log('3. Create "id-verifications" bucket in Supabase');
console.log('4. Create INSERT and SELECT policies');
