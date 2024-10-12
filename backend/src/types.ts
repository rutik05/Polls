export interface Poll{
    id: string;
    question: string;
    options : Option[];
}

export interface  Option{
    optionId: string;
    optionText: string;
    votes : number;
}

export interface ClientMessage{
    type : string;
    pollsId ?: string;
    optionId ?: string;
}
export interface ServerMessage{
    type : string;
    data ?: Poll[] | Option[];
    pollsId ?: string;
    optionId ?: string;
    message ?: string;
    results ?: Option[];
}