// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'HeyZack LaunchBoom Templates',
			description: 'Comprehensive template library for successful crowdfunding campaigns',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/heyzack' }
			],
			sidebar: [
				{
					label: '🏗️ Foundation',
					autogenerate: { directory: 'foundation' },
				},
				{
					label: '🎯 Campaign Core',
					autogenerate: { directory: 'campaign-core' },
				},
				{
					label: '📧 Email Marketing',
					autogenerate: { directory: 'email-marketing' },
				},
				{
					label: '📢 Advertising',
					autogenerate: { directory: 'advertising' },
				},
				{
					label: '🎨 Visual Assets',
					autogenerate: { directory: 'visual-assets' },
				},
				{
					label: '📋 Supporting Materials',
					autogenerate: { directory: 'supporting-materials' },
				},
				{
					label: '⚙️ Project Management',
					autogenerate: { directory: 'project-management' },
				},
				{
					label: '📝 Templates Master',
					autogenerate: { directory: 'templates-master' },
				},
				{
					label: '📊 Strategic Analysis',
					autogenerate: { directory: 'strategic-analysis' },
				},
				{
					label: '📚 Reference Materials',
					autogenerate: { directory: 'reference-materials' },
				},
			],
		}),
	],
});
