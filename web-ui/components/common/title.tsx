import React from 'react';

interface titleProps{
    title: String,
    subTitle?: String,
}

const Title = ({title, subTitle}: titleProps) => {
    return (
        <div className={"my-1"}>
            <h1 className={"text-3xl font-bold"}>{title}</h1>
            {subTitle && <h1 className={"text-lg font-mono"}>{subTitle}</h1>}
        </div>
    );
};

export default Title;