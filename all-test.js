var TestResult = function() {
    this.succeeded = false;
    this.reason = "";
    this.input = "";
    this.expected_output = "";
    this.actual_output = "";
}

var executeTests = function(){
  var results = [];
  const result = new TestResult();
  result.input = "getTweetsHandler({pageSize: 10, sortOrder: 'recent'})";
  result.expected_output = '[]';
  let output = getTweetsHandler({pageSize: 10, sortOrder: 'recent'});
  result.actual_output = String(output);
  if (output instanceof Array && output.length === 0) {
    result.succeeded = true;
    result.reason = "Succeeded";
  } else {
    result.succeeded = false;
    result.reason = "Expected an empty list";
  }
  results.push(result);
  
  const firstTweet = {
    message: 'I like space',
    name: 'Space Man',
    handle: 'spaceman'
  };
  
  postTweetHandler({tweet: firstTweet});
  
  const afterPostResult = new TestResult();
  afterPostResult.input = "getTweetsHandler({pageSize: 10, sortOrder: 'recent'})";
  afterPostResult.expected_output = `[{message: ${firstTweet.message}, name: ${firstTweet.name}, handle: ${firstTweet.handle}}]`;
  output = getTweetsHandler({pageSize: 10, sortOrder: 'recent'});
  afterPostResult.actual_output = String(output);
  if (output instanceof Array && output.length === 1 && output[0] === firstTweet) {
    afterPostResult.succeeded = true;
    afterPostResult.reason = "Succeeded";
  } else {
    afterPostResult.succeeded = false;
    afterPostResult.reason = "Expected the first tweet";
  }
  results.push(afterPostResult);
  
  const secondTweet = {
    message: 'I like space 2',
    name: 'Space Man 2',
    handle: 'spaceman2'
  };
  
  postTweetHandler({tweet: secondTweet});
  
  const afterSecondPostResult = new TestResult();
  afterSecondPostResult.input = "getTweetsHandler({pageSize: 10, sortOrder: 'recent'})";
  afterSecondPostResult.expected_output = `
		[{
			message: ${firstTweet.message}, 
			name: ${firstTweet.name}, 
			handle: ${firstTweet.handle}
	   }, 
		 {message: ${secondTweet.message}, 
		  name: ${secondTweet.name}, 
      handle: ${secondTweet.handle}
		}]
	`;
  output = getTweetsHandler({pageSize: 10, sortOrder: 'recent'});
  afterSecondPostResult.actual_output = String(output);
  if (output instanceof Array && output.length === 1 && output[0] === firstTweet && output[1] === secondTweet) {
    afterSecondPostResult.succeeded = true;
    afterSecondPostResult.reason = "Succeeded";
  } else {
    afterSecondPostResult.succeeded = false;
    afterSecondPostResult.reason = "Expected the tweets in order";
  }
  results.push(afterPostResult);
            
  return results;
}