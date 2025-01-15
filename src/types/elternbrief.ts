export type Elternbrief = {
    id: number;
    readConfirmationId: number | undefined;
    status: string;
    title: string;
    messageText: string;
    classes: string;
    date: string;
    link: string;
};