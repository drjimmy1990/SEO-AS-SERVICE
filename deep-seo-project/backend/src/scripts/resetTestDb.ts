import supabase from '../services/supabase';

async function reset() {
    console.log('Cleaning up localhost projects...');
    // Fetch projects with domain 'localhost'
    const { data: projects, error: fetchError } = await supabase.from('projects').select('id').eq('domain', 'localhost');

    if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        return;
    }

    if (projects && projects.length > 0) {
        const ids = projects.map(p => p.id);

        // Delete pages associated with these projects
        const { error: pagesError } = await supabase.from('pages').delete().in('project_id', ids);
        if (pagesError) {
            console.error('Pages delete error:', pagesError);
        } else {
            console.log(`Deleted pages for ${ids.length} project(s).`);
        }

        // Delete the projects themselves
        const { error: projError } = await supabase.from('projects').delete().in('id', ids);
        if (projError) {
            console.error('Project delete error:', projError);
        } else {
            console.log(`Deleted ${ids.length} project(s).`);
        }
    } else {
        console.log('No localhost projects found to clean up.');
    }
}

reset();
