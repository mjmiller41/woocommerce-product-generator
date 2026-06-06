import React from "react";
import { LifestyleConfig } from "../types";
import { Sparkles, Sliders, Image, Type, Lightbulb } from "lucide-react";

interface PresetScene {
	id: string;
	name: string;
	emoji: string;
	prompt: string;
}

export const SCENE_PRESETS: PresetScene[] = [
	{
		id: "luxury_bath",
		name: "Luxury Bathroom Vanity",
		emoji: "🫧",
		prompt: "on a pristine Carrara white marble bathroom vanity countertop, framed by sophisticated eucalyptus leaf stems, elegant ribbed accessory glass jars, and soft warm glowing light.",
	},
	{
		id: "modern_kitchen",
		name: "Modern Quartz Kitchen",
		emoji: "🌿",
		prompt: "on a smooth white quartz kitchen island countertop, with freshly cut Mediterranean herbs, decorative olive oil cruets, and soft ambient wooden cupboard details in the backdrop.",
	},
	{
		id: "cozy_cafe",
		name: "Rustic Wooden Cafe Coffee Table",
		emoji: "☕",
		prompt: "resting elegantly on a warm reclaimed wood study table in a coffee house, beside a steaming artisanal latte cup, an open natural paper notebook, and cozy sunbeams.",
	},
	{
		id: "concrete_pedestal",
		name: "Brutalist Concrete Pedestal",
		emoji: "🗿",
		prompt: "placed on a sleek architectural concrete block pedestal against a pastel sandy-pink textured plaster wall under artistic high-contrast drop-shadow palm leaf lighting.",
	},
	{
		id: "organic_spa",
		name: "Zen Organic Spa & Basalt Stone",
		emoji: "🎋",
		prompt: "centered on a wet black volcanic basalt stone, surrounded by green bamboo leaves, small white wild orchids, and a misty dark slate background with morning dew droplets.",
	},
	{
		id: "cyberpunk_neon",
		name: "Modern Tech / Neon Desk",
		emoji: "💻",
		prompt: "resting on a premium matte brushed metallic computer desk organizer, surrounded by ambient teal and deep magenta neon reflections in a moody cyberpunk workspace setup.",
	},
	{
		id: "artisan_workbench",
		name: "Artisan Woodworker Bench",
		emoji: "🪚",
		prompt: "resting on a sturdy oak woodworker's workbench, surrounded by fine wood shavings, vintage carving tools, and soft natural sunlight streaming through a dusty workshop window.",
	},
	{
		id: "wedding_table",
		name: "Elegant Wedding Setup",
		emoji: "🥂",
		prompt: "displayed on a fine linen tablecloth at a romantic wedding reception, adorned with soft white florals, crystal glassware out of focus in the background, and warm candlelit ambiance.",
	},
	{
		id: "craft_market",
		name: "Rustic Craft Market Display",
		emoji: "⛺",
		prompt: "showcased on a burlap-covered artisan market table under a white canopy tent, with subtle natural outdoor lighting and hints of leafy greenery blurred in the background.",
	},
	{
		id: "acrylic_neon_desk",
		name: "RGB Creator Desk",
		emoji: "⚡",
		prompt: "sitting on a clean dark desk surface beside a mechanical keyboard, illuminated by vibrant colorful RGB LED strip lighting, highlighting bright edge reflections.",
	},
	{
		id: "holiday_mantle",
		name: "Festive Holiday Mantle",
		emoji: "🎄",
		prompt: "placed playfully upon a cozy living room fireplace mantle, draped in pine garlands, warm twinkling fairy lights, and a softly glowing fire out-of-focus below.",
	},
	{
		id: "custom",
		name: "Custom Lifestyle Scene...",
		emoji: "✍️",
		prompt: "",
	},
];

const LIGHTING_PROFILES = [
	{ id: "golden_hour", name: "Golden Hour Warmth", desc: "Warm, low-angle organic sunshine rays", rating: "Warm & Cozy" },
	{ id: "studio_softbox", name: "Professional Softbox", desc: "Even, clean, professional daylight with diffuse shadows", rating: "Crisp & Clean" },
	{ id: "dramatic_contrast", name: "Dramatic Rim Light", desc: "Moody studio shadow gradients and high-contrast styling", rating: "Luxury / Premium" },
	{ id: "cyber_ambient", name: "Cyberpunk Ambient", desc: "Deep futuristic neon backglow reflections", rating: "Futuristic / Bold" },
	{ id: "natural_morning", name: "Natural Morning Sunbeams", desc: "Crisp cool sunlight filtering through thin windows", rating: "Fresh & Bright" },
];

const ASPECT_RATIOS = [
	{ id: "1:1", name: "Square", icon: "1:1", desc: "Social & E-Comm", style: "aspect-square w-6 h-6" },
	{ id: "4:3", name: "Classic Photo", icon: "4:3", desc: "Classic landscape", style: "aspect-4/3 w-7 h-5" },
	{ id: "3:4", name: "Catalog Entry", icon: "3:4", desc: "Portrait catalogs", style: "aspect-3/4 w-5 h-7" },
	{ id: "16:9", name: "Wide Banner", icon: "16:9", desc: "Header banner", style: "aspect-16/9 w-9 h-5" },
	{ id: "9:16", name: "Mobile Story", icon: "9:16", desc: "Vertical reels", style: "aspect-9/16 w-4 h-8" },
];

interface ConfigPanelProps {
	config: LifestyleConfig;
	onChange: (updated: LifestyleConfig) => void;
	onGenerate: () => void;
	disabled: boolean;
	hasProductAnalyzed: boolean;
}

export default function ConfigPanel({
	config,
	onChange,
	onGenerate,
	disabled,
	hasProductAnalyzed,
}: ConfigPanelProps) {

	const handleUpdate = (key: keyof LifestyleConfig, value: any) => {
		onChange({
			...config,
			[key]: value,
		});
	};

	const handlePresetChange = (presetId: string) => {
		const selected = SCENE_PRESETS.find((p) => p.id === presetId);
		if (selected) {
			onChange({
				...config,
				presetId,
				scenePrompt: selected.prompt,
			});
		}
	};

	return (
		<div id="lifestyle-config-panel" className="bg-white border border-brand-200 rounded-2xl p-5 shadow-xs flex flex-col h-full overflow-y-auto">
			<div className="flex items-center gap-2 pb-3 border-b border-brand-100 mb-4 h-auto">
				<div className="p-1 px-2.5 bg-brand-900 text-white text-[10px] uppercase tracking-wider font-semibold rounded-md flex items-center gap-1">
					<Sliders className="h-3 w-3" />
					Settings
				</div>
				<h2 className="font-display font-semibold text-brand-900 text-base">Scene Director</h2>
			</div>

			<div className="space-y-5 flex-1">
				{/* Style Engine Selector */}
				<div>
					<label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
						AI Rendering Method
					</label>
					<div className="grid grid-cols-2 gap-2" id="engine-selector">
						<button
							type="button"
							id="engine-i2i"
							onClick={() => handleUpdate("engine", "image-to-image")}
							className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${config.engine === "image-to-image"
									? "bg-brand-900 border-brand-900 shadow-sm text-white"
									: "bg-white border-brand-200 text-brand-900 hover:border-brand-500 hover:bg-brand-100/20"
								}`}
						>
							<div className="flex items-center gap-1.5 mb-1">
								<Image className="h-3.5 w-3.5" />
								<span className="font-display font-medium text-xs">Smart Placement</span>
							</div>
							<p className={`text-[10px] leading-normal ${config.engine === "image-to-image" ? "text-brand-100" : "text-gray-500"}`}>
								Keeps your exact uploaded item, organically designing the environment around it.
							</p>
						</button>

						<button
							type="button"
							id="engine-t2i"
							onClick={() => handleUpdate("engine", "text-to-image")}
							className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${config.engine === "text-to-image"
									? "bg-brand-900 border-brand-900 shadow-sm text-white"
									: "bg-white border-brand-200 text-brand-900 hover:border-brand-500 hover:bg-brand-100/20"
								}`}
						>
							<div className="flex items-center gap-1.5 mb-1">
								<Type className="h-3.5 w-3.5" />
								<span className="font-display font-medium text-xs">Studio Re-creation</span>
							</div>
							<p className={`text-[10px] leading-normal ${config.engine === "text-to-image" ? "text-brand-100" : "text-gray-500"}`}>
								Uses state-of-the-art Imagen 4 to compile a brand-new photorealistic full studio mock.
							</p>
						</button>
					</div>
				</div>

				{/* Scene Presets */}
				<div>
					<label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
						Lifestyle Ambient Preset
					</label>
					<div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 bg-brand-100/15 p-1 rounded-xl border border-brand-100/50" id="scene-preset-grid">
						{SCENE_PRESETS.map((preset) => (
							<button
								key={preset.id}
								type="button"
								onClick={() => handlePresetChange(preset.id)}
								className={`flex items-center gap-2 p-2 rounded-lg text-left border transition-all text-xs cursor-pointer truncate ${config.presetId === preset.id
										? "bg-brand-500 border-brand-500 text-white font-medium"
										: "bg-white border-brand-200/80 text-brand-900 hover:border-brand-500"
									}`}
							>
								<span className="text-sm">{preset.emoji}</span>
								<span className="truncate">{preset.name}</span>
							</button>
						))}
					</div>
				</div>

				{/* Custom prompt details */}
				<div>
					<div className="flex items-center justify-between mb-1.5">
						<label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
							Environment Setting Composition
						</label>
						<span className="text-[10px] text-gray-400 italic">
							Type or edit scene details
						</span>
					</div>
					<textarea
						value={config.scenePrompt}
						onChange={(e) => {
							handleUpdate("scenePrompt", e.target.value);
							if (config.presetId !== "custom") {
								handleUpdate("presetId", "custom");
							}
						}}
						placeholder="Describe where the product is placed, surface, backgrounds, details, decorative items nearby..."
						className="w-full text-xs leading-normal font-sans text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2.5 focus:outline-hidden focus:border-brand-500 resize-none h-[75px]"
					/>
				</div>

				{/* Studio Lighting profile */}
				<div>
					<div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
						<Lightbulb className="h-3.5 w-3.5 text-amber-500" />
						Studio Lighting Profile
					</div>
					<div className="space-y-1.5 max-h-[110px] overflow-y-auto p-1 bg-brand-100/10 rounded-xl border border-brand-100/60" id="lighting-profile-selector">
						{LIGHTING_PROFILES.map((profile) => (
							<button
								key={profile.id}
								type="button"
								onClick={() => handleUpdate("lighting", profile.name)}
								className={`w-full flex items-center justify-between p-2 rounded-lg text-left border transition-all text-xs cursor-pointer ${config.lighting === profile.name
										? "bg-brand-100 border-brand-200/80 font-semibold text-brand-900"
										: "bg-white border-brand-100 text-gray-700 hover:border-brand-200"
									}`}
							>
								<div>
									<div className="font-medium text-[11px]">{profile.name}</div>
									<div className="text-[9px] text-gray-400 font-normal leading-none mt-0.5">{profile.desc}</div>
								</div>
								<span className="text-[9px] uppercase tracking-wider font-mono text-gray-400 bg-brand-200/40 px-1.5 py-0.5 rounded ml-2">
									{profile.rating}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Framing & Aspect Ratio */}
				<div>
					<label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
						Framing Aspect Ratio
					</label>
					<div className="grid grid-cols-5 gap-1.5" id="aspect-ratio-selector">
						{ASPECT_RATIOS.map((ratio) => (
							<button
								key={ratio.id}
								type="button"
								onClick={() => handleUpdate("aspectRatio", ratio.id)}
								className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${config.aspectRatio === ratio.id
										? "bg-brand-900/5 border-brand-900 text-brand-900 font-bold shadow-xs"
										: "bg-white border-brand-200 text-gray-600 hover:border-brand-400"
									}`}
								title={ratio.name}
							>
								<div className={`border border-current rounded mb-1 flex items-center justify-center text-[7px] font-mono bg-white text-brand-500 scale-90 ${ratio.style}`}>
									{ratio.icon}
								</div>
								<div className="text-[9px] font-semibold leading-none">{ratio.id}</div>
								<div className="text-[8px] text-gray-400 truncate mt-0.5 max-w-[45px] text-center font-normal">{ratio.name}</div>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Main Dynamic Generation Action */}
			<div className="mt-5 pt-3 border-t border-brand-100 h-auto">
				<button
					type="button"
					id="generate-btn"
					disabled={disabled}
					onClick={onGenerate}
					className="w-full flex items-center justify-center gap-2 bg-brand-900 hover:bg-brand-600 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-display font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
				>
					<Sparkles className="h-4.5 w-4.5 animate-pulse text-yellow-300" />
					Generate Lifestyle Scene
				</button>
				{!hasProductAnalyzed && !disabled && (
					<p className="text-[9px] text-gray-400 text-center mt-1.5">
						* Will auto-generate attributes and product scenes.
					</p>
				)}
			</div>
		</div>
	);
}
