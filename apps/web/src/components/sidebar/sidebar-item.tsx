import { usePathname } from "next/navigation";

import { BookOpenCheckIcon } from "lucide-react";
import { Link } from "../fastLink";

// Types for sidebar items
interface SidebarItem {
	href: string;
	label: string;
	icon: React.ReactNode;
}

// Array of sidebar items
const sidebarItems: SidebarItem[] = [
	{
		href: "/demo/initiatives",
		label: "Initiatives",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				role="img"
				fill="currentColor"
				viewBox="0 0 16 16"
				height="16"
				width="16"
				className="sc-bGlxtf kTBUaM"
			>
				<path
					d="M7.4145 8.3381C7.68162 7.8873 8.31838 7.8873 8.5855 8.3381L11.896 13.925C12.2589 14.5374 11.6035 15.2506 10.9879 14.9132L8.10753 13.3343C8.04032 13.2975 7.95967 13.2975 7.89247 13.3343L5.0121 14.9132C4.39652 15.2506 3.74112 14.5374 4.10401 13.925L7.4145 8.3381Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
				<path
					d="M13.5 8C13.5 4.96243 11.0376 2.5 8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 8.96927 2.75037 9.87822 3.18945 10.668L3.38867 10.999L3.42773 11.0654C3.60231 11.4033 3.4953 11.825 3.16992 12.0371C2.84468 12.249 2.41642 12.1766 2.17773 11.8809L2.13281 11.8184L2.00195 11.6104C1.36597 10.5558 1 9.31963 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 9.40749 14.5834 10.7198 13.8672 11.8184L13.8223 11.8809C13.5836 12.1766 13.1553 12.249 12.8301 12.0371C12.4831 11.8109 12.3851 11.346 12.6113 10.999L12.8105 10.668C13.2496 9.87822 13.5 8.96927 13.5 8Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
			</svg>
		),
	},
	{
		href: "/demo/projects/all",
		label: "Projects",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				role="img"
				fill="currentColor"
				viewBox="0 0 16 16"
				height="16"
				width="16"
				className="sc-hisVHm iwyJhO"
			>
				<path
					d="M7.33105 1.07021C7.77198 0.976596 8.22802 0.976596 8.66895 1.07021C9.1672 1.17605 9.6359 1.44664 10.5732 1.9872L11.9268 2.76748C12.8641 3.30803 13.333 3.57878 13.6738 3.95693C13.9752 4.2914 14.2035 4.68521 14.3428 5.11318C14.5001 5.59712 14.5 6.13848 14.5 7.21963V8.78017L14.4971 9.49795C14.4897 10.1285 14.4608 10.5238 14.3428 10.8866L14.2861 11.0448C14.1451 11.4117 13.9377 11.7501 13.6738 12.0429L13.5391 12.1806C13.2082 12.493 12.7469 12.7594 11.9268 13.2323L10.5732 14.0126L9.9502 14.369C9.39962 14.678 9.04262 14.8502 8.66895 14.9296L8.50293 14.9608C8.16979 15.0135 7.83021 15.0135 7.49707 14.9608L7.33105 14.9296C6.95738 14.8502 6.60038 14.678 6.0498 14.369L5.42676 14.0126L4.07324 13.2323C3.2531 12.7594 2.79183 12.493 2.46094 12.1806L2.32617 12.0429C2.06233 11.7501 1.85488 11.4117 1.71387 11.0448L1.65723 10.8866C1.53919 10.5238 1.51032 10.1285 1.50293 9.49795L1.5 8.78017V7.21963C1.5 6.27371 1.50007 5.74117 1.60547 5.29873L1.65723 5.11318C1.7791 4.73862 1.96931 4.39024 2.2168 4.08486L2.32617 3.95693C2.58189 3.67325 2.90966 3.44975 3.45312 3.12783L4.07324 2.76748L5.42676 1.9872C6.24682 1.51427 6.70825 1.24812 7.14453 1.11806L7.33105 1.07021ZM3 7.21963V8.78017C3 9.96256 3.01759 10.2186 3.08398 10.4228L3.14844 10.5897C3.22143 10.7534 3.31983 10.9052 3.44043 11.039L3.49902 11.0995C3.65041 11.242 3.92593 11.4166 4.82227 11.9335L6.17578 12.7138L6.80762 13.0731C6.9955 13.1781 7.13824 13.2517 7.25 13.3075V8.48232L3.00293 6.55166L3 7.21963ZM8.75 8.48232V13.3075C8.96244 13.2018 9.28343 13.0256 9.82422 12.7138L11.1777 11.9335L11.8057 11.5663C12.3045 11.2694 12.4515 11.1588 12.5596 11.039L12.6729 10.8993C12.7782 10.7544 12.8604 10.5936 12.916 10.4228L12.9385 10.3417C12.9727 10.1976 12.9894 9.99056 12.9961 9.50674L13 8.78017V7.21963L12.9961 6.55166L8.75 8.48232ZM7.82031 2.50967L7.64258 2.53701C7.4843 2.57063 7.31505 2.64327 6.80762 2.92666L6.17578 3.28603L4.82227 4.06631C3.9258 4.5833 3.65039 4.75778 3.49902 4.90029L3.44043 4.96084C3.4102 4.99438 3.3809 5.02866 3.35352 5.06435L7.99902 7.17568L12.6436 5.06435L12.5596 4.96084C12.4515 4.84096 12.3046 4.7305 11.8057 4.43349L11.1777 4.06631L9.82422 3.28603C8.92706 2.76864 8.63802 2.61817 8.43848 2.55849L8.35742 2.53701C8.18065 2.49948 7.9993 2.49086 7.82031 2.50967Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
			</svg>
		),
	},
	{
		href: "/demo/knowledge-base",
		label: "Knowledge Base",
		icon: <BookOpenCheckIcon size={16} />,
	},
	{
		href: "/demo/views/issues",
		label: "Views",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				role="img"
				fill="currentColor"
				viewBox="0 0 16 16"
				height="16"
				width="16"
				className="sc-cQHnRM jVcNKo"
			>
				<path
					d="M6.93213 2.21398C7.66484 1.90793 8.49512 1.93032 9.21389 2.28028L14.28 4.74739C15.2242 5.20709 15.2441 6.55895 14.3138 7.04673L9.2874 9.6826C8.48012 10.1058 7.51988 10.1058 6.7126 9.6826L1.68618 7.04673C0.75589 6.55895 0.775786 5.20709 1.71995 4.74739L6.78611 2.28028L6.93213 2.21398ZM8.55132 3.67054C8.24643 3.52213 7.89768 3.50303 7.58179 3.61428L7.44868 3.67054L2.83947 5.91363L7.41491 8.31243C7.7819 8.50486 8.2181 8.50486 8.58509 8.31243L13.1595 5.91363L8.55132 3.67054Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
				<path
					d="M13.9045 10.0768C14.272 9.90435 14.7242 10.0333 14.9153 10.365C15.1063 10.6966 14.9634 11.1047 14.5959 11.2772L9.49912 13.6693C8.55934 14.1102 7.44077 14.1102 6.50099 13.6693L1.40417 11.2772L1.33776 11.2428C1.01976 11.0547 0.905685 10.676 1.08483 10.365C1.26402 10.054 1.67295 9.92085 2.02626 10.0477L2.0956 10.0768L7.19241 12.468L7.38675 12.5464C7.84801 12.7022 8.36492 12.6757 8.80769 12.468L13.9045 10.0768Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
			</svg>
		),
	},
];

// Helper function to render a single sidebar item
export function SidebarItemComponent({
	href,
	label,
	icon,
}: {
	href: string;
	label: string;
	icon: React.ReactNode;
}) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<div className="m-0 border-0 p-0 align-baseline">
			<div className="relative m-0 rounded-none border-0 p-0 align-baseline">
				<div
					className="m-0 border-0 p-0 align-baseline"
					data-visible-sidebar-item="true"
				>
					<div className="m-0 h-auto border-0 p-0 align-baseline opacity-100 [transform:none]">
						<div
							className={`group/testitem relative mx-0 my-px cursor-default rounded border-0 p-0 align-baseline hover:bg-[lch(94.333_0_282.863)] dark:hover:bg-[lch(7.133_2.333_272)] ${
								isActive
									? "bg-[lch(94.333_0_282.863)] dark:bg-[lch(7.133_2.333_272)]"
									: ""
							}`}
						>
							<div className="m-0 block flex-row border-0 p-0 align-baseline">
								<div
									className="m-0 border-0 p-0 align-baseline outline-offset-[-3px]"
									data-contextual-menu="true"
								>
									<Link
										href={href}
										prefetch={true}
										draggable="true"
										className="focus-visible:-outline-offset-1 m-0 flex cursor-default items-center rounded border-0 p-0 align-baseline text-[lch(9.723_0_282.863)] no-underline transition-[color] duration-[0.15s] [-webkit-box-align:center] dark:text-[lch(100_0_272)]"
										data-active={isActive.toString()}
									>
										<span
											className={`m-0 flex h-7 grow items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap rounded border-0 fill-[lch(37.976_1_282.863)] py-0 pr-0.5 pl-1.5 text-left align-baseline font-[450] text-[13px] text-[lch(18.988_1_282.863)] [-webkit-box-align:center] [-webkit-box-flex:1] group-hover/testitem:text-[lch(9.723_0_282.863)] dark:fill-[lch(61.683_1_272)] dark:text-[lch(90.421_1_272)] dark:group-hover/testitem:text-[lch(100_0_272)] ${
												isActive
													? "text-[lch(9.723_0_282.863)] dark:text-[lch(100_0_272)]"
													: ""
											}`}
										>
											<span
												className={`mr-2 text-[lch(37.976_1_282.863)] group-hover/testitem:text-[lch(9.723_0_282.863)] dark:text-[lch(61.683_1_272)] dark:group-hover/testitem:text-[lch(100_0_272)] ${
													isActive
														? "text-[lch(9.723_0_282.863)] dark:text-[lch(100_0_272)]"
														: ""
												}`}
											>
												{icon}
											</span>
											{label}
										</span>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main component
export function TestItems() {
	return (
		<div>
			<div className="m-0 border-0 p-0 align-baseline">
				{sidebarItems.map((item, index) => (
					<SidebarItemComponent
						key={`${item.href}-${index}`}
						href={item.href}
						label={item.label}
						icon={item.icon}
					/>
				))}
			</div>
		</div>
	);
}
