import './Content.css'

function ContentWrapper({children, page_name}) {
    return (
        <div className="content-wrapper">
            <div className="content-wrapper-content">
                <div className="content-wrapper-content-name">
                    {page_name}
                </div>
                <div className="content-wrapper-content-border">
                    <div className="content-wrapper-content-data">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContentWrapper