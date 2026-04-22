// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://heyzack-launchboom-templates.vercel.app',
	integrations: [
		starlight({
			title: 'HeyZack LaunchBoom Templates',
			logo: {
				src: './public/logo-light.svg',
				replacesTitle: true,
			},
			description: 'Comprehensive template library for successful crowdfunding campaigns',
			components: {
				ThemeProvider: './src/components/ForceDarkTheme.astro',
				ThemeSelect: './src/components/EmptyComponent.astro',
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/heyzack' }
			],
			customCss: [
				'./src/styles/starlight-custom.css',
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
				{
					label: '📖 Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
