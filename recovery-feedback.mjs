export function recoveryFeedback() {
  return `<section class="recovery-feedback" id="customer-feedback" aria-labelledby="feedback-title">
    <div class="wrap feedback-layout">
      <div class="feedback-intro"><h2 id="feedback-title">Customer <em>feedback</em></h2><p data-review-average hidden></p></div>
      <p class="review-status" data-review-load role="status">Loading customer reviews...</p>
      <div class="feedback-deck"><ul class="feedback-track" tabindex="0" aria-label="Customer reviews. Use the left and right arrow keys to browse."></ul><div class="review-controls"><button type="button" data-review-prev aria-label="Previous review">&#8592;</button><button type="button" data-review-next aria-label="Next review">&#8594;</button></div></div>
      <div class="review-form-panel">
        <h3>Share your experience</h3><p>Your name, rating and review will be published on this website immediately.</p>
        <form id="customer-review-form">
          <div class="review-fields"><label>Your name<input name="author" autocomplete="name" required minlength="2" maxlength="60"></label><label>Rating<select name="rating" required><option value="">Choose a rating</option><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Very poor</option></select></label></div>
          <label>Your review<textarea name="text" required minlength="15" maxlength="1200" rows="3" placeholder="Tell us about the service you received"></textarea></label>
          <label class="review-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
          <label class="review-consent"><input type="checkbox" name="consent" required> I used this service and agree to publish my name, rating and review.</label>
          <noscript><p>Enable JavaScript to submit a review.</p></noscript><button type="submit" class="button" disabled>Submit review</button><p data-review-submit role="status"></p>
        </form>
      </div>
    </div>
  </section>`;
}
