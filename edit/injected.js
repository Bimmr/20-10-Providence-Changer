$(function () {
  // $("body").append(
  //   "<style>"+
  //     "#app-wrapper > #header{z-index: 10 !important;}"+
  //     "#app-wrapper > #page-settings-overlay{top: 60px !important;}"+
  //   "</style>");
  //When the chat opens
  $(".open-chat, #open-chat").on("click", function() {

    //Wait for the chat to initialize
    setTimeout(() => {

      //When the chat gets opened, display saved message
      if (localStorage.getItem('savedChatMsg')) {
        $($("#chatMessage").find(".fr-wrapper")).removeClass("show-placeholder");
        $($("#chatMessage").find(".fr-element")).html(localStorage.getItem('savedChatMsg'));
      }

      //When the chat gets closed, save the message
      $(".close-chat").on("click", function() {
        if (!$($("#chatMessage").find(".fr-wrapper")).hasClass("show-placeholder")) {
          localStorage.setItem('savedChatMsg', $($("#chatMessage").find(".fr-element")).html());
        }
      });

      //When message is sent remove from saved message
      $(".chat-tools").find(".send-message").on('click', function() {
        localStorage.setItem('savedChatMsg', null);
        $("#loadLastMessage").hide();
      });
    }, 2000);
  });
});
