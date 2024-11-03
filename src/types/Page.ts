export interface PageModel {
    page_id: string,
    module: "basic" | "custom",
    page_name: string;
    position?: {
        x: number;
        y: number;
    }
}