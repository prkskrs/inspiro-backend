class WhereClause{
    constructor(base,bigQuery){
        this.base = base;
        this.bigQuery = bigQuery;
    }

    search(){
        const searchWord = this.bigQuery.search ? {
            $regex : this.bigQuery.search,
            $options : 'i'
        } : {}

        this.base = this.base.find({...searchWord})
        return this;
    }

    filter(){
        const copyQuery = {...this.bigQuery}
        delete copyQuery["search"];
        delete copyQuery["page"]; 
        delete copyQuery["limit"];

        // convert bigQuery into a string ==> copyQuery
        let stringOfCopyQuery = JSON.stringify(copyQuery);

        stringOfCopyQuery = stringOfCopyQuery.replace(/(gte|lte|gt|lt)/g,m=>`$${m}`);

        const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

        this.base = this.base.find(jsonOfCopyQuery)

        return this;
    }

    pager(resultPerPage){
        // assumed
        let currentPage = 1;

        // update as in bigQuery
        if(this.bigQuery.page){
            currentPage = this.bigQuery.page;
        }

        const skipValue = resultPerPage * (currentPage - 1)

        this.base = this.base.limit(resultPerPage).skip(skipValue)

        return this;

    }


    // order really matter for skip features


}

module.exports={WhereClause}