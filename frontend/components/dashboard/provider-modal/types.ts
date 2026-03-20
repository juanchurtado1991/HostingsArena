export interface TabProps {
    formData: any;
    handleChange: (path: string, value: any) => void;
    type: "hosting" | "vpn";
}
