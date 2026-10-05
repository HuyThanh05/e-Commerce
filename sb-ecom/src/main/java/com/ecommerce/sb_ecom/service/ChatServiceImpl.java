package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.exceptions.ResourceNotFoundException;
import com.ecommerce.sb_ecom.model.ChatConversation;
import com.ecommerce.sb_ecom.model.ChatMessage;
import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.payload.ChatConversationDTO;
import com.ecommerce.sb_ecom.payload.ChatMessageDTO;
import com.ecommerce.sb_ecom.payload.SendChatMessageRequest;
import com.ecommerce.sb_ecom.repositories.ChatConversationRepository;
import com.ecommerce.sb_ecom.repositories.ChatMessageRepository;
import com.ecommerce.sb_ecom.repositories.ProductRepository;
import com.ecommerce.sb_ecom.repositories.UserRepository;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    public ChatServiceImpl(ChatConversationRepository conversationRepository,
                           ChatMessageRepository messageRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           AuthUtil authUtil) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.authUtil = authUtil;
    }

    @Override
    public ChatConversationDTO createConversation(Long productId) {
        User customer = authUtil.loggedInUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        User seller = product.getUser();
        if (seller == null) throw new APIException("This product does not have a seller");
        if (seller.getUserId().equals(customer.getUserId())) {
            throw new APIException("You cannot start a conversation with yourself");
        }

        ChatConversation conversation = conversationRepository.findByCustomerAndSeller(customer, seller)
                .orElseGet(() -> {
                    ChatConversation created = new ChatConversation();
                    created.setCustomer(customer);
                    created.setSeller(seller);
                    created.setProductId(product.getProductId());
                    created.setProductName(product.getProductName());
                    created.setProductImage(product.getImage());
                    return conversationRepository.save(created);
                });
        conversation.setProductId(product.getProductId());
        conversation.setProductName(product.getProductName());
        conversation.setProductImage(product.getImage());
        conversation = conversationRepository.save(conversation);
        return toConversationDTO(conversation, customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationDTO> getConversations() {
        User user = authUtil.loggedInUser();
        return conversationRepository.findForUser(user).stream()
                .map(conversation -> toConversationDTO(conversation, user))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessages(Long conversationId) {
        User user = authUtil.loggedInUser();
        ChatConversation conversation = getAuthorizedConversation(conversationId, user);
        return messageRepository.findByConversationOrderBySentAtAsc(conversation).stream()
                .map(this::toMessageDTO)
                .toList();
    }

    @Override
    public void markRead(Long conversationId) {
        User user = authUtil.loggedInUser();
        ChatConversation conversation = getAuthorizedConversation(conversationId, user);
        messageRepository.markRead(conversation, user, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return messageRepository.countUnreadForUser(authUtil.loggedInUser());
    }

    @Override
    public ChatMessageDTO sendMessage(String username, SendChatMessageRequest request) {
        User sender = userRepository.findByUserName(username)
                .orElseThrow(() -> new APIException("Authenticated user was not found"));
        ChatConversation conversation = getAuthorizedConversation(request.getConversationId(), sender);
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isBlank()) throw new APIException("Message content cannot be empty");

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        ChatMessage saved = messageRepository.save(message);
        conversation.setUpdatedAt(saved.getSentAt());
        conversationRepository.save(conversation);
        return toMessageDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getRecipientUsername(Long conversationId, String senderUsername) {
        User sender = userRepository.findByUserName(senderUsername)
                .orElseThrow(() -> new APIException("Authenticated user was not found"));
        ChatConversation conversation = getAuthorizedConversation(conversationId, sender);
        return conversation.getCustomer().getUserId().equals(sender.getUserId())
                ? conversation.getSeller().getUserName()
                : conversation.getCustomer().getUserName();
    }

    private ChatConversation getAuthorizedConversation(Long id, User user) {
        ChatConversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "conversationId", id));
        boolean participant = conversation.getCustomer().getUserId().equals(user.getUserId())
                || conversation.getSeller().getUserId().equals(user.getUserId());
        if (!participant) throw new APIException("You are not a participant in this conversation");
        return conversation;
    }

    private ChatConversationDTO toConversationDTO(ChatConversation conversation, User currentUser) {
        User other = conversation.getCustomer().getUserId().equals(currentUser.getUserId())
                ? conversation.getSeller() : conversation.getCustomer();
        ChatMessage latest = messageRepository.findFirstByConversationOrderBySentAtDesc(conversation).orElse(null);
        long unread = messageRepository.countByConversationAndSenderNotAndReadAtIsNull(conversation, currentUser);
        return new ChatConversationDTO(
                conversation.getConversationId(),
                conversation.getCustomer().getUserId(), conversation.getCustomer().getUserName(),
                conversation.getSeller().getUserId(), conversation.getSeller().getUserName(),
                other.getUserId(), other.getUserName(),
                conversation.getProductId(), conversation.getProductName(), conversation.getProductImage(),
                latest == null ? "Bắt đầu cuộc trò chuyện" : latest.getContent(),
                latest == null ? conversation.getUpdatedAt() : latest.getSentAt(), unread);
    }

    private ChatMessageDTO toMessageDTO(ChatMessage message) {
        return new ChatMessageDTO(message.getMessageId(), message.getConversation().getConversationId(),
                message.getSender().getUserId(), message.getSender().getUserName(), message.getContent(),
                message.getSentAt(), message.getReadAt());
    }
}
