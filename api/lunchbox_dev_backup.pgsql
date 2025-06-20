PGDMP         %                }           lunchbox_dev    14.18 (Homebrew)    14.18 (Homebrew) 3               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16384    lunchbox_dev    DATABASE     W   CREATE DATABASE lunchbox_dev WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';
    DROP DATABASE lunchbox_dev;
                tyler    false            �            1259    16434    InventoryItem    TABLE     �  CREATE TABLE public."InventoryItem" (
    id text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    expiration timestamp(3) without time zone,
    opened boolean DEFAULT false NOT NULL,
    "productId" text NOT NULL,
    "locationId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    price double precision,
    "storeId" text
);
 #   DROP TABLE public."InventoryItem";
       public         heap    tyler    false            �            1259    16413    Location    TABLE     Q   CREATE TABLE public."Location" (
    id text NOT NULL,
    name text NOT NULL
);
    DROP TABLE public."Location";
       public         heap    tyler    false            �            1259    16427    Product    TABLE     !  CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "defaultQuantity" text,
    "defaultUnit" text,
    "defaultLocationId" text,
    "defaultUnitTypeId" text,
    "categoryId" text,
    "inventoryBehavior" integer DEFAULT 1 NOT NULL
);
    DROP TABLE public."Product";
       public         heap    tyler    false            �            1259    16406    ProductCategory    TABLE     X   CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    name text NOT NULL
);
 %   DROP TABLE public."ProductCategory";
       public         heap    tyler    false            �            1259    17951    ShoppingListItem    TABLE     �  CREATE TABLE public."ShoppingListItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text,
    name text,
    unit text,
    quantity double precision DEFAULT 1 NOT NULL,
    price double precision,
    "storeId" text,
    "vendorId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text
);
 &   DROP TABLE public."ShoppingListItem";
       public         heap    tyler    false            �            1259    17960    ShoppingListItemHistory    TABLE     �  CREATE TABLE public."ShoppingListItemHistory" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text,
    name text,
    unit text,
    quantity double precision NOT NULL,
    price double precision,
    "storeId" text,
    "vendorId" text,
    notes text,
    "removedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "shoppingListItemId" text,
    "categoryId" text
);
 -   DROP TABLE public."ShoppingListItemHistory";
       public         heap    tyler    false            �            1259    16443    Store    TABLE     N   CREATE TABLE public."Store" (
    id text NOT NULL,
    name text NOT NULL
);
    DROP TABLE public."Store";
       public         heap    tyler    false            �            1259    16420    Unit    TABLE     M   CREATE TABLE public."Unit" (
    id text NOT NULL,
    name text NOT NULL
);
    DROP TABLE public."Unit";
       public         heap    tyler    false            �            1259    16398    User    TABLE       CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."User";
       public         heap    tyler    false            �            1259    16387    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap    tyler    false                      0    16434    InventoryItem 
   TABLE DATA           �   COPY public."InventoryItem" (id, quantity, unit, expiration, opened, "productId", "locationId", "userId", "createdAt", "updatedAt", price, "storeId") FROM stdin;
    public          tyler    false    215   -F                 0    16413    Location 
   TABLE DATA           .   COPY public."Location" (id, name) FROM stdin;
    public          tyler    false    212   I                 0    16427    Product 
   TABLE DATA           �   COPY public."Product" (id, name, description, "defaultQuantity", "defaultUnit", "defaultLocationId", "defaultUnitTypeId", "categoryId", "inventoryBehavior") FROM stdin;
    public          tyler    false    214   �I                 0    16406    ProductCategory 
   TABLE DATA           5   COPY public."ProductCategory" (id, name) FROM stdin;
    public          tyler    false    211   K                 0    17951    ShoppingListItem 
   TABLE DATA           �   COPY public."ShoppingListItem" (id, "userId", "productId", name, unit, quantity, price, "storeId", "vendorId", notes, "createdAt", "updatedAt", "categoryId") FROM stdin;
    public          tyler    false    217   �K                 0    17960    ShoppingListItemHistory 
   TABLE DATA           �   COPY public."ShoppingListItemHistory" (id, "userId", "productId", name, unit, quantity, price, "storeId", "vendorId", notes, "removedAt", "shoppingListItemId", "categoryId") FROM stdin;
    public          tyler    false    218   �K                 0    16443    Store 
   TABLE DATA           +   COPY public."Store" (id, name) FROM stdin;
    public          tyler    false    216   �K                 0    16420    Unit 
   TABLE DATA           *   COPY public."Unit" (id, name) FROM stdin;
    public          tyler    false    213   L                 0    16398    User 
   TABLE DATA           U   COPY public."User" (id, email, password, name, "createdAt", "updatedAt") FROM stdin;
    public          tyler    false    210   !M                 0    16387    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public          tyler    false    209   *N       p           2606    16442     InventoryItem InventoryItem_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."InventoryItem" DROP CONSTRAINT "InventoryItem_pkey";
       public            tyler    false    215            i           2606    16419    Location Location_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Location" DROP CONSTRAINT "Location_pkey";
       public            tyler    false    212            f           2606    16412 $   ProductCategory ProductCategory_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."ProductCategory" DROP CONSTRAINT "ProductCategory_pkey";
       public            tyler    false    211            n           2606    16433    Product Product_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_pkey";
       public            tyler    false    214            w           2606    17967 4   ShoppingListItemHistory ShoppingListItemHistory_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public."ShoppingListItemHistory"
    ADD CONSTRAINT "ShoppingListItemHistory_pkey" PRIMARY KEY (id);
 b   ALTER TABLE ONLY public."ShoppingListItemHistory" DROP CONSTRAINT "ShoppingListItemHistory_pkey";
       public            tyler    false    218            u           2606    17959 &   ShoppingListItem ShoppingListItem_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."ShoppingListItem"
    ADD CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_pkey";
       public            tyler    false    217            s           2606    16449    Store Store_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Store" DROP CONSTRAINT "Store_pkey";
       public            tyler    false    216            l           2606    16426    Unit Unit_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."Unit" DROP CONSTRAINT "Unit_pkey";
       public            tyler    false    213            c           2606    16405    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            tyler    false    210            `           2606    16395 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public            tyler    false    209            g           1259    16452    Location_name_key    INDEX     Q   CREATE UNIQUE INDEX "Location_name_key" ON public."Location" USING btree (name);
 '   DROP INDEX public."Location_name_key";
       public            tyler    false    212            d           1259    16451    ProductCategory_name_key    INDEX     _   CREATE UNIQUE INDEX "ProductCategory_name_key" ON public."ProductCategory" USING btree (name);
 .   DROP INDEX public."ProductCategory_name_key";
       public            tyler    false    211            q           1259    16454    Store_name_key    INDEX     K   CREATE UNIQUE INDEX "Store_name_key" ON public."Store" USING btree (name);
 $   DROP INDEX public."Store_name_key";
       public            tyler    false    216            j           1259    16453    Unit_name_key    INDEX     I   CREATE UNIQUE INDEX "Unit_name_key" ON public."Unit" USING btree (name);
 #   DROP INDEX public."Unit_name_key";
       public            tyler    false    213            a           1259    16450    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            tyler    false    210            |           2606    16475 +   InventoryItem InventoryItem_locationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Y   ALTER TABLE ONLY public."InventoryItem" DROP CONSTRAINT "InventoryItem_locationId_fkey";
       public          tyler    false    212    215    3689            {           2606    16470 *   InventoryItem InventoryItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 X   ALTER TABLE ONLY public."InventoryItem" DROP CONSTRAINT "InventoryItem_productId_fkey";
       public          tyler    false    214    215    3694            ~           2606    17194 (   InventoryItem InventoryItem_storeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 V   ALTER TABLE ONLY public."InventoryItem" DROP CONSTRAINT "InventoryItem_storeId_fkey";
       public          tyler    false    215    216    3699            }           2606    16480 '   InventoryItem InventoryItem_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 U   ALTER TABLE ONLY public."InventoryItem" DROP CONSTRAINT "InventoryItem_userId_fkey";
       public          tyler    false    3683    215    210            z           2606    16465    Product Product_categoryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 M   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_categoryId_fkey";
       public          tyler    false    3686    211    214            x           2606    16455 &   Product Product_defaultLocationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_defaultLocationId_fkey" FOREIGN KEY ("defaultLocationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_defaultLocationId_fkey";
       public          tyler    false    214    3689    212            y           2606    16460 &   Product Product_defaultUnitTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_defaultUnitTypeId_fkey" FOREIGN KEY ("defaultUnitTypeId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public."Product" DROP CONSTRAINT "Product_defaultUnitTypeId_fkey";
       public          tyler    false    213    214    3692            �           2606    17988 G   ShoppingListItemHistory ShoppingListItemHistory_shoppingListItemId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ShoppingListItemHistory"
    ADD CONSTRAINT "ShoppingListItemHistory_shoppingListItemId_fkey" FOREIGN KEY ("shoppingListItemId") REFERENCES public."ShoppingListItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 u   ALTER TABLE ONLY public."ShoppingListItemHistory" DROP CONSTRAINT "ShoppingListItemHistory_shoppingListItemId_fkey";
       public          tyler    false    3701    218    217            �           2606    17983 ;   ShoppingListItemHistory ShoppingListItemHistory_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ShoppingListItemHistory"
    ADD CONSTRAINT "ShoppingListItemHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 i   ALTER TABLE ONLY public."ShoppingListItemHistory" DROP CONSTRAINT "ShoppingListItemHistory_userId_fkey";
       public          tyler    false    210    218    3683            �           2606    17973 0   ShoppingListItem ShoppingListItem_productId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ShoppingListItem"
    ADD CONSTRAINT "ShoppingListItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 ^   ALTER TABLE ONLY public."ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_productId_fkey";
       public          tyler    false    214    3694    217            �           2606    17978 .   ShoppingListItem ShoppingListItem_storeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ShoppingListItem"
    ADD CONSTRAINT "ShoppingListItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 \   ALTER TABLE ONLY public."ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_storeId_fkey";
       public          tyler    false    3699    217    216                       2606    17968 -   ShoppingListItem ShoppingListItem_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ShoppingListItem"
    ADD CONSTRAINT "ShoppingListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 [   ALTER TABLE ONLY public."ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_userId_fkey";
       public          tyler    false    3683    217    210               �  x�Ŗ�j%7��}�b^����J�^&�y��H*������33���0�^�.���ui�^�n��[�2iC�P�]4��⃎��><�_��#+��'���s�cX]ka 3N(}vh[
)��]���h!��"�
�a�3*�=}��}TӀ���Y�{Z�S4O�뇈<�>Q��\�gc���艭����LQF!h]�&�y��S��n�*;��8�h]���/V���y�p w�����q/3��PvI��@�\u�����$�?}}|������49&!�Q�����I�QV�}JPs�wcA�*zj{�/)���5�������h�G���A������V�T5�Чqj��S��5�j��i��_>�wWݼ����q�<����ŵ��;y��}?��w��OD9��z`:,X&��ԸSCk�-!�6V��|۽�S&�����E#������@���$�°K�0�%$���^�;��%�P
,Z�C�w�J����%�������*ik"T�,�mY��<KGz4��h�w���8����T&��	�mY��w���#ۃ5�FF���?�x�@O���J�ﭓ�S�}n���H�=x�K��Q~	��G�K<����v~o�k8Vƕn�&=?*��,���k��Տm��3M��]Cܒ���<�_�wI}���
�9!�Wĩ��i�jI ���[-��tm;~�|�r�n�?��4�         d   x����0 �O�'�N�H�~�رD��a��S���r��Kb47g��m��|��f�f	9Ղ%��F�Q��������M�q�~3 �S^�         �  x���Aj�1�����P�eK����d#�Lg �������2P���>?i�p���t5���WB��K�/������~���wu̽�n@:
��,l�ar�u�-���<�Zw-V��U�~�\�u2T�l���	�Υ��q��j)������f5e���v������0ݏo�ۓ�Ba[O
&�sf"��Y7iX�b��#�Ct���{��ج��*������iHށ��\�_���~��Gjcb=��oB�t,����.e��H�22�*U'�I�kP_m�z���IL4^��0�(���5%�@%)'����h޸C���+8k��]Eb
Q`dG⬜��2��k�'��v�~�ס#�1�
�B)\a�K�K�0єk�ס���\.���         y   x�̱1 �����;N��K�4N��%<��p��f2��*(�:6���Ʊ\z-k��O�� #Ni���VP�ڠ�l>dX�|���:��k��tE���M�J���v;��/ �1�%H            x������ � �            x������ � �         �   x�̻
B1 ���_"i�JFg?�%m|�A�z��ᠸg�̩C���L�fa*uP������')jf&�,w�1�Ǿ�fط����sH�r�X�\8e"���H-{ݎ����Y<!`�r�
R�2YmQh����B?�1=         �   x��91 �:��Q��9Zhy���	�J����:�ܠ�!@���(<�Pi�ΟM����]��
��U�;�0�
VY��q<-����P����@�"���K6�pٷC��b��f�&W��_�j4�u��S��.�1�         �   x�u��n�0 Eg�
V#��SSHEJ�B]lp-�<(��(K�f��J��4�� ����P�@���B��X��O榺Sk���,kAWy��r���*Ʒ=·����+��)icu��虝�Uȏ?�xEdɹ5CL \��Q�x�c�r��a�4� J�U�R
���@�6H	|���fS�K����e���t��6��]�4�J�~]2�Y��q3��l��:��?%� D4$�#�=���g��/$�^P           x�m�]jc1���U�$��r1+(ے��������~��Є$��s4+�2S�G2%H�[�F��	��Ӈ��:;X�02��E�}� !�̣�{�Ȋ�k�dȒ@�({�=�D�r~�z�$c:O���������8�]�p۠ �2,q��:O�#zS��1�Ti1�%3���kff�d��s��Z�E� YU��>�^ʞpgV��� �����k�.������x~>�����#����\
�;[�Z�%/��1R��"�.�kg�Mg��lI��f�mڬ�FTb2�*s
p�>��p�K_z#3�#C��r%{YTq��?������4�w�p;�2�@2�51"���i�%uoE�F'��U�:p�y_�R�B�Á�K[�Z�c�#��,������pWH�冩�a�w�^�OO�ӯ���˗��Ʌ�Þ�*Z��&�Mfj=�T(�eCcS��j�zT��}i�:���J��4�.��ב�{T����-V��i'"|��Φ �c���7(�C���z�m����� �     