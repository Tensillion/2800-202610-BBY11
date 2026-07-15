export function tutorialsEnabled(): boolean {
	if (typeof window === "undefined") return true;
	return localStorage.getItem("tutorialsEnabled") !== "false";
}