from augurai import augur
# Wrapper function to call Augur AI and generate threat analysis using product info and diagram
def augur_service(product_info, product_diagram, prompts_file, max_tokens=4000):
    return augur(product_info, product_diagram, prompts_file, max_tokens)